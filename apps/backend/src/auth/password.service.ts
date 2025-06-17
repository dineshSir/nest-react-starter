import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ResetForgottenPasswordDto } from './dtos/request-reset-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ValidateResetPasswordOTPDto } from './dtos/validate-reset-password-otp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/common/helper-modules/hashing/hashing.service';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { jwtConfig } from 'src/configurations/jwt.config';
import { ConfigType } from '@nestjs/config';
import { TokenIdsStorage } from 'src/common/helper-modules/redis/redis-refresh-token.service';
import { EmailService } from 'src/common/helper-modules/mailing/mailing.service';
import { InvalidOTPException } from 'src/common/errors/esewa-payment-gateway.errors';
import { getRandomInt } from 'src/common/helper-functions/random-integers.helper';
import { loginOTPTemplate } from 'src/common/helper-modules/mailing/html-as-constants/login-otp-email';
import { AuthenticationService } from './authentication.service';
import { ChangePasswordDto } from './dtos/change-password.otp';
import { ActiveUserData } from './interfaces/active-user-data.interfce';

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly tokenIdsStorage: TokenIdsStorage,
    private readonly emailService: EmailService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    loggedInUser: ActiveUserData,
  ) {
    const user = await this.usersRepository.findOne({
      select: ['id', 'email', 'password', 'roles'],
      where: { email: loggedInUser.email },
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException(`User does not exist.`);
    const isEqual = await this.hashingService.compare(
      changePasswordDto.existingPassword,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException(`Old password does not match.`);
    }

    const newHashedPassword = await this.hashingService.hash(
      changePasswordDto.newPassword,
    );

    Object.assign(user, { password: newHashedPassword });
    const updatedUserInstance = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(updatedUserInstance);
    return {
      success: true,
      message: `Password updated successfully.`,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    let tokenEmail: string;
    try {
      const { email } = await this.jwtService.verifyAsync(
        resetPasswordDto.resetPasswordToken,
        {
          secret: this.jwtConfiguration.resetPasswordSecret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      );
      tokenEmail = email;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'OTP token has expired. Please request a new one.',
        );
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid reset password token.');
      } else {
        throw new UnauthorizedException('OTP verification failed.');
      }
    }

    if (resetPasswordDto.email !== tokenEmail)
      throw new UnauthorizedException(
        `Unauthorized to reset account password - emails mismatch.`,
      );

    const user = await this.usersRepository.findOne({
      select: ['id', 'email', 'password', 'roles'],
      where: { email: tokenEmail },
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException(`User does not exist.`);

    if (
      await this.hashingService.compare(
        resetPasswordDto.password,
        user.password,
      )
    )
      throw new ConflictException(
        `You entered old password. Try again with a different one.`,
      );

    const hashedPassword = await this.hashingService.hash(
      resetPasswordDto.password,
    );

    Object.assign(user, { password: hashedPassword });
    const updatedUserInstance = this.usersRepository.create(user);
    const updatedUser = await this.usersRepository.save(updatedUserInstance);

    return {
      success: true,
      message: `Password reset successfull. Continue signing in to your account.`,
    };
  }

  async validateResetPasswordOTP(
    validateResetPasswordOTPDto: ValidateResetPasswordOTPDto,
  ) {
    let tokenEmail: string;
    try {
      const { email } = await this.jwtService.verifyAsync(
        validateResetPasswordOTPDto.resetPasswordOTPToken,
        {
          secret: this.jwtConfiguration.resetPasswordOtpSecret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      );
      tokenEmail = email;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'OTP token has expired. Please request a new one.',
        );
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid OTP token.');
      } else {
        throw new UnauthorizedException('OTP verification failed.');
      }
    }
    if (validateResetPasswordOTPDto.email !== tokenEmail)
      throw new UnauthorizedException(
        `Unauthorized to reset account password - emails mismatch.`,
      );

    const user = await this.usersRepository.findOne({
      select: ['id'],
      where: { email: tokenEmail },
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException(`User does not exist.`);

    try {
      const isValid = await this.tokenIdsStorage.validateOTP(
        user.id,
        String(validateResetPasswordOTPDto.otp + 6377),
      );

      if (isValid) {
        await this.tokenIdsStorage.invalidate(user.id);
      }
    } catch (error) {
      if (error instanceof InvalidOTPException) throw error;
      throw new InternalServerErrorException(`Error checking validity of OTP.`);
    }

    const resetPasswordToken = await this.authenticationService.signToken(
      user.id,
      this.jwtConfiguration.resetPasswordTokenTtl,
      this.jwtConfiguration.resetPasswordSecret!,
      { email: tokenEmail },
    );

    return {
      success: true,
      message: `It's a valid OTP, continue resetting password.`,
      resetPasswordToken: resetPasswordToken,
    };
  }

  async getResetPasswordOTP(
    resetForgottenPasswordDto: ResetForgottenPasswordDto,
  ) {
    const user = await this.usersRepository.findOne({
      where: { email: resetForgottenPasswordDto.email },
    });
    if (!user)
      throw new UnauthorizedException(
        `Email does not exist on our system. Continue with Signing Up.`,
      );

    const otp = getRandomInt(100000, 999999);
    await this.emailService.sendMail(
      resetForgottenPasswordDto.email,
      `Nest-react-starter reset password otp`,
      loginOTPTemplate,
      { name: resetForgottenPasswordDto.email.split('@')[0], otp: otp },
    );

    await this.tokenIdsStorage.insert(user.id, String(otp + 6377));

    const resetPasswordOTPToken = await this.authenticationService.signToken(
      user.id,
      this.jwtConfiguration.resetPasswordOTPTokenTtl,
      this.jwtConfiguration.resetPasswordOtpSecret!,
      { email: resetForgottenPasswordDto.email },
    );

    return {
      success: true,
      message: `OTP has been sent to your email. Valid for 5 minutes.`,
      resetPasswordOTPToken: resetPasswordOTPToken,
    };
  }
}

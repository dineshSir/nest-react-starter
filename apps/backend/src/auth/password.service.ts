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
import { EmailService } from 'src/common/helper-modules/mailing/mailing.service';
import { InvalidOTPException } from 'src/common/errors/esewa-payment-gateway.errors';
import { getRandomInt } from 'src/common/helper-functions/random-integers.helper';
import { AuthenticationService } from './authentication.service';
import { ChangePasswordDto } from './dtos/change-password.otp';
import { ActiveUserData } from './interfaces/active-user-data.interfce';
import { resetPasswordOTP } from 'src/common/helper-modules/mailing/html-as-constants/reset-password-otp';
import { RedisStorageService } from 'src/common/helper-modules/redis/redis-storage.service';
import { REDIS_RESET_PASSWORD_OTP_KEY_PART } from './constants/auth-constants';

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly redisStorageService: RedisStorageService,
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
    const existingPasswordMatch = await this.hashingService.compare(
      changePasswordDto.existingPassword,
      user.password,
    );
    if (!existingPasswordMatch) {
      throw new UnauthorizedException(`Old password does not match.`);
    }

    const matchWithPreviousPassword = await this.hashingService.compare(
      changePasswordDto.newPassword,
      user.password,
    );

    if (matchWithPreviousPassword)
      throw new ConflictException(
        `New password should be different from the previous one.`,
      );

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
      const storedPasswordOTPValue =
        await this.redisStorageService.getStoredValue(
          REDIS_RESET_PASSWORD_OTP_KEY_PART,
          user.id,
        );

      if (!storedPasswordOTPValue)
        throw new InvalidOTPException(
          `User information changed. Error getting stored OTP for comparision.`,
        );

      const isValidOTP = await this.hashingService.compare(
        String(validateResetPasswordOTPDto.otp),
        storedPasswordOTPValue,
      );
      if (isValidOTP) {
        await this.redisStorageService.invalidate(
          REDIS_RESET_PASSWORD_OTP_KEY_PART,
          user.id,
        );
      } else {
        throw new InvalidOTPException(
          `Invalid OTP. Please check and try again.`,
        );
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
      resetPasswordOTP,
      { name: resetForgottenPasswordDto.email.split('@')[0], otp: otp },
    );

    const hashedPasswordOTP = await this.hashingService.hash(String(otp));
    await this.redisStorageService.insert(
      REDIS_RESET_PASSWORD_OTP_KEY_PART,
      user.id,
      hashedPasswordOTP,
    );

    const resetPasswordOTPToken = await this.authenticationService.signToken(
      user.id,
      this.jwtConfiguration.resetPasswordOTPTokenTtl,
      this.jwtConfiguration.resetPasswordOtpSecret!,
      { email: resetForgottenPasswordDto.email },
    );
    return {
      success: true,
      message: `OTP has been sent to your email. Valid for 3 minutes.`,
      resetPasswordOTPToken: resetPasswordOTPToken,
    };
  }
}

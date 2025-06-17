import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { safeError } from 'src/common/helper-functions/safe-error.helper';
import { SignUpDto } from './dtos/sign-up.dto';
import { ConfigType } from '@nestjs/config';
import { HashingService } from 'src/common/helper-modules/hashing/hashing.service';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { runInTransaction } from 'src/common/helper-functions/transaction.helper';
import { In, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SignInDto } from './dtos/sign-in.dto';
import { randomUUID } from 'crypto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ActiveUserData } from './interfaces/active-user-data.interfce';
import { SignUpUserDto } from './dtos/sign-up-user.dto';
import { jwtConfig } from 'src/configurations/jwt.config';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { EmailService } from 'src/common/helper-modules/mailing/mailing.service';
import { loginOTPTemplate } from 'src/common/helper-modules/mailing/html-as-constants/login-otp-email';
import { GetSignInOTPDto } from './dtos/get-login.otp';
import { getRandomInt } from 'src/common/helper-functions/random-integers.helper';
import { OTPLoginDto } from './dtos/otp-login.dto';
import {
  InvalidOTPException,
  InvalidTokenException,
} from 'src/common/errors/esewa-payment-gateway.errors';
import {
  REDIS_REFRESH_TOKEN_KEY_PART,
  REDIS_SIGN_IN_OTP_KEY_PART,
} from './constants/auth-constants';
import { RedisStorageService } from 'src/common/helper-modules/redis/redis-storage.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly redisStorageService: RedisStorageService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const [message, error] = await safeError(
      runInTransaction(async (queryRunner: QueryRunner) => {
        const roleRepository = queryRunner.manager.getRepository(Role);
        const [regularRole, _error] = await safeError(
          roleRepository.findOne({
            where: { name: 'regular' },
          }),
        );
        if (_error)
          throw new InternalServerErrorException(
            `Error getting role to assign to the new user.`,
          );
        if (!regularRole)
          throw new NotFoundException(
            "Error assigning default 'regular' role to the user, check if the role exist.",
          );

        const userRepository = queryRunner.manager.getRepository(User);
        const existingUser = await userRepository.findOne({
          where: { email: signUpDto.email },
        });
        if (existingUser)
          throw new ConflictException(
            `Email already registered in the system.`,
          );

        const hashedPassword = await this.hashingService.hash(
          signUpDto.password,
        );

        const userInstance = Object.assign(new User(), {
          email: signUpDto.email,
          password: hashedPassword,
          roles: [regularRole],
        });

        const user = userRepository.create(userInstance);
        const savedUser = await userRepository.save(user);

        return {
          success: true,
          message: `User created and saved successfully.`,
        };
      }),
    );
    if (error) throw error;
    return message;
  }

  async signUpUser(signUpUserDto: SignUpUserDto) {
    const [message, error] = await safeError(
      runInTransaction(async (queryRunner: QueryRunner) => {
        const userRepository = queryRunner.manager.getRepository(User);
        const existingUser = await userRepository.findOne({
          where: { email: signUpUserDto.email },
        });
        if (existingUser)
          throw new ConflictException(
            `Email already registered in the system.`,
          );

        const incommingRoleIds = signUpUserDto.roleIds.filter((id) => id !== 1); //dont allow to create a super user
        const roleInstances = await queryRunner.manager.find(Role, {
          where: { id: In(incommingRoleIds) },
        });

        const foundRoleIds = roleInstances.map(
          (roleInstance: Role) => roleInstance.id,
        );

        const missingRoleIds = incommingRoleIds.filter(
          (id: number) => !foundRoleIds.includes(id),
        );
        if (missingRoleIds.length > 0)
          throw new NotFoundException(
            `Role/s not found for id/s: ${missingRoleIds.join(', ')}`,
          );

        const hashedPassword = await this.hashingService.hash(
          signUpUserDto.password,
        );

        const userInstance = Object.assign(new User(), {
          email: signUpUserDto.email,
          password: hashedPassword,
          roles: roleInstances,
        });

        const user = userRepository.create(userInstance);
        const savedUser = await userRepository.save(user);

        return {
          success: true,
          message: `User created and saved successfully.`,
        };
      }),
    );
    if (error) throw error;
    return message;
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersRepository.findOne({
      select: ['id', 'email', 'password', 'roles'],
      where: { email: signInDto.email },
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException(`User does not exist.`);
    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException(`Password does not match.`);
    }
    return await this.generateTokens(user);
  }

  async otpSignIn(oTPLoginDto: OTPLoginDto) {
    let tokenUserId: number, tokenEmail: string;
    try {
      const { sub, email } = await this.jwtService.verifyAsync(
        oTPLoginDto.otpToken,
        {
          secret: this.jwtConfiguration.signInOtpSecret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      );
      [tokenUserId, tokenEmail] = [sub, email];
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'OTP token has expired. Please request a new one.',
        );
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid sign in token.');
      } else {
        throw new UnauthorizedException('OTP verification failed.');
      }
    }

    const user = await this.usersRepository.findOne({
      select: ['id', 'email', 'password', 'roles'],
      where: { id: tokenUserId, email: tokenEmail },
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException(`User does not exist.`);

    try {
      const storedOTPValue = await this.redisStorageService.getStoredValue(
        REDIS_SIGN_IN_OTP_KEY_PART,
        user.id,
      );

      if (!storedOTPValue)
        throw new InvalidOTPException(
          `User information changed. Error getting stored OTP for comparision.`,
        );

      const isValidOTP = await this.hashingService.compare(
        String(oTPLoginDto.otp),
        storedOTPValue,
      );

      if (isValidOTP) {
        await this.redisStorageService.invalidate(
          REDIS_SIGN_IN_OTP_KEY_PART,
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

    return await this.generateTokens(user);
  }

  async getLoginOTP(getSignInOTPDto: GetSignInOTPDto) {
    const user = await this.usersRepository.findOne({
      where: { email: getSignInOTPDto.email },
    });
    if (!user) throw new UnauthorizedException(`User does not exist.`);

    const otp = getRandomInt(100000, 999999);
    await this.emailService.sendMail(
      getSignInOTPDto.email,
      `Nest-react-starter login otp`,
      loginOTPTemplate,
      { name: getSignInOTPDto.email.split('@')[0], otp: otp },
    );

    const hashedOTP = await this.hashingService.hash(String(otp));

    await this.redisStorageService.insert(
      REDIS_SIGN_IN_OTP_KEY_PART,
      user.id,
      hashedOTP,
    );

    const OTPToken = await this.signToken(
      user.id,
      this.jwtConfiguration.signInOTPTokenTtl,
      this.jwtConfiguration.signInOtpSecret!,
      { email: getSignInOTPDto.email },
    );

    return {
      success: true,
      message: `OTP has been sent to your email. Valid for 3 minutes.`,
      OTPToken: OTPToken,
    };
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        this.jwtConfiguration.secret!,
        // { email: user.email, role: user.role } this was for Roles Guard
        { email: user.email, roles: user.roles.map((role) => role.name) },
      ),
      this.signToken(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        this.jwtConfiguration.secret!,
        {
          refreshTokenId: refreshTokenId,
        },
      ),
    ]);

    await this.redisStorageService.insert(
      REDIS_REFRESH_TOKEN_KEY_PART,
      user.id,
      refreshTokenId,
    );

    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      );

      const user = await this.usersRepository.findOne({
        select: ['id', 'email', 'roles'],
        where: { id: sub },
        relations: ['roles'],
      });
      if (!user)
        throw new NotFoundException('This person is not the user anymore.');

      const isValid = await this.redisStorageService.validate(
        REDIS_REFRESH_TOKEN_KEY_PART,
        user.id,
        refreshTokenId,
      );

      if (isValid) {
        await this.redisStorageService.invalidate(
          REDIS_REFRESH_TOKEN_KEY_PART,
          user.id,
        );
      } else {
        throw new Error('Refresh token is invalid');
      }

      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidTokenException) throw error;
      throw new UnauthorizedException(`Unauthorized to access resource.`);
    }
  }

  async signToken<T>(
    userId: number,
    expiresIn: number,
    secret: string,
    payload?: T,
  ) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      } as ActiveUserData,
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: secret,
        expiresIn,
      },
    );
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RequiredPermissions } from './decorators/permission.decorator';
import { RolePermissions } from './enums/role-permission.enum';
import { SignUpUserDto } from './dtos/sign-up-user.dto';
import { ActiveUser } from './decorators/active-user.decorator';
import { ActiveUserData } from './interfaces/active-user-data.interfce';
import { GetSignInOTPDto } from './dtos/get-login.otp';
import { OTPLoginDto } from './dtos/otp-login.dto';
import { ResetForgottenPasswordDto } from './dtos/request-reset-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ValidateResetPasswordOTPDto } from './dtos/validate-reset-password-otp.dto';
import { PasswordService } from './password.service';
import { ChangePasswordDto } from './dtos/change-password.otp';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly passwordService: PasswordService,
  ) {}
  @Auth(AuthType.None)
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authenticationService.signUp(signUpDto);
  }

  @Auth(AuthType.Bearer)
  @Post('sign-up-user')
  @RequiredPermissions(RolePermissions.createUser)
  async signUpUser(@Body() signUpUserDto: SignUpUserDto) {
    console.log('hello');
    return await this.authenticationService.signUpUser(signUpUserDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    return await this.authenticationService.signIn(signInDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('get-sign-in-otp')
  async getLoginOTP(@Body() getSignInOTPDto: GetSignInOTPDto) {
    return await this.authenticationService.getLoginOTP(getSignInOTPDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('otp-sign-in')
  async otpSignIn(@Body() oTPLoginDto: OTPLoginDto) {
    return await this.authenticationService.otpSignIn(oTPLoginDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authenticationService.refreshTokens(refreshTokenDto);
  }

  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async chnagePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @ActiveUser() loggedInUser: ActiveUserData,
  ) {
    return await this.passwordService.changePassword(
      changePasswordDto,
      loggedInUser,
    );
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('request-password-reset')
  async requestPasswordReset(
    @Body() resetForgottenPasswordDto: ResetForgottenPasswordDto,
  ) {
    return await this.passwordService.getResetPasswordOTP(
      resetForgottenPasswordDto,
    );
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('request-reset-password-otp-validation')
  async validateResetPasswordOtp(
    @Body() validateResetPasswordOTPDto: ValidateResetPasswordOTPDto,
  ) {
    return await this.passwordService.validateResetPasswordOTP(
      validateResetPasswordOTPDto,
    );
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('reset-forgotten-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.passwordService.resetPassword(resetPasswordDto);
  }

  @Auth(AuthType.Bearer)
  @Get('me')
  me(@ActiveUser() loggedInUser: ActiveUserData) {
    return { email: loggedInUser.email, roles: loggedInUser.roles };
  }
}

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
import { GetSignInOTPDto } from './dtos/get-login-otp';
import { OTPLoginDto } from './dtos/otp-login.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}
  @Auth(AuthType.None)
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authenticationService.signUp(signUpDto);
  }

  @Auth(AuthType.Bearer)
  @Post('sign-up-user')
  @RequiredPermissions(RolePermissions.createUser)
  signUpUser(@Body() signUpUserDto: SignUpUserDto) {
    console.log('hello');
    return this.authenticationService.signUpUser(signUpUserDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    return this.authenticationService.signIn(signInDto);
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

  @Auth(AuthType.Bearer)
  @Get('me')
  me(@ActiveUser() loggedInUser: ActiveUserData) {
    return { email: loggedInUser.email, roles: loggedInUser.roles };
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokenDto);
  }
}

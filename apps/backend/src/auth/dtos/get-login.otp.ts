import { IsEmail, IsString } from 'class-validator';

export class GetSignInOTPDto {
  @IsString()
  email: string;
}

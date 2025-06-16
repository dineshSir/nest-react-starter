import { IsEmail, IsNumber, IsString } from 'class-validator';

export class OTPLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  otpToken: string;

  @IsNumber()
  otp: number;
}

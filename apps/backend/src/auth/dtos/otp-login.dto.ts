import { IsEmail, IsNumber, IsString } from 'class-validator';

export class OTPLoginDto {
  @IsString()
  otpToken: string;

  @IsNumber()
  otp: number;
}

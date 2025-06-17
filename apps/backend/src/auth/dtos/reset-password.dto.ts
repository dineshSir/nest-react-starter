import {
  IsEmail,
  IsNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNumber()
  otp: number;

  @IsString()
  resetPasswordToken: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;
}

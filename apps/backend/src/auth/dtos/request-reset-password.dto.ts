import { IsEmail } from 'class-validator';

export class ResetForgottenPasswordDto {
  @IsEmail()
  email: string;
}

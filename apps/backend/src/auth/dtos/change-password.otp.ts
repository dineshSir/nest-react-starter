import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  existingPassword: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: 'Password must contain at least one letter and one number',
  })
  newPassword: string;
}

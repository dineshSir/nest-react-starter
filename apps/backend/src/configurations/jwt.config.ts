import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    signInOtpSecret: process.env.JWT_SIGN_IN_OTP_SECRET,
    resetPasswordOtpSecret: process.env.JWT_RESET_PASSWORD_OTP_SECRET,
    resetPasswordSecret: process.env.JWT_RESET_PASSWORD_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '3600', 10),
    refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TOKEN_TTL ?? '86400', 10),
    signInOTPTokenTtl: parseInt(process.env.JWT_OTP_TTL ?? '180', 10),
    resetPasswordOTPTokenTtl: parseInt(
      process.env.JWT_RESET_PASSWORD_OTP_TTL ?? '180',
      10,
    ),
    resetPasswordTokenTtl: parseInt(
      process.env.JWT_RESET_PASSWORD_TTL ?? '180',
      10,
    ),
  };
});

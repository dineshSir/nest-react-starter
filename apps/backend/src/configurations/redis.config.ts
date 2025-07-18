import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => {
  return {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  };
});

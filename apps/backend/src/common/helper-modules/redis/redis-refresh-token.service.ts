import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import {
  InvalidOTPException,
  InvalidTokenException,
} from 'src/common/errors/esewa-payment-gateway.errors';
import { redisConfig } from 'src/configurations/redis.config';

@Injectable()
export class TokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
  ) {}
  private redishClient: Redis;
  onApplicationBootstrap() {
    this.redishClient = new Redis({
      host: this.redisConfiguration.host,
      port: this.redisConfiguration.port,
    });
  }

  onApplicationShutdown(signal?: string) {
    return this.redishClient.quit();
  }

  async insert(userId: number, tokenId: string) {
    const stored = await this.redishClient.set(this.getKey(userId), tokenId);
    return stored;
  }

  async validate(userId: number, tokenId: string) {
    const storedId = await this.redishClient.get(this.getKey(userId));
    if (storedId !== tokenId) throw new InvalidTokenException(`Invalid token.`);
    return storedId === tokenId;
  }

  async validateOTP(userId: number, otpIdentifier: string) {
    const storedId = await this.redishClient.get(this.getKey(userId));
    if (storedId !== otpIdentifier)
      throw new InvalidOTPException(`Invalid OTP. Please try again.`);
    return storedId === otpIdentifier;
  }

  async invalidate(userId: number) {
    await this.redishClient.del(this.getKey(userId));
  }

  private getKey(userId: number) {
    return `user-${userId}`;
  }
}

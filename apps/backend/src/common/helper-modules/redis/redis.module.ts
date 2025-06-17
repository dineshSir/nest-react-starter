import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenIdsStorage } from './redis-refresh-token.service';
import { redisConfig } from 'src/configurations/redis.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [TokenIdsStorage],
  exports: [TokenIdsStorage],
})
export class RedisModule {}

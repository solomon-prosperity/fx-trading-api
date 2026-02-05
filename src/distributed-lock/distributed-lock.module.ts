import { Global, Module } from '@nestjs/common';
import { DistributedLockService } from './services/distributed-lock.service';
import { RedisService } from 'src/redis/redis.service';

@Global()
@Module({
  providers: [DistributedLockService, RedisService],
  exports: [DistributedLockService],
  imports: [],
})
export class DistributedLockModule {}

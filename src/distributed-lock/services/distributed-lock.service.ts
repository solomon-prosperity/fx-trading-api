import { Injectable, Logger } from '@nestjs/common';
import { DistributedLock } from '../interfaces/distributed-lock.interface';
import { CronLockKeyEnum } from '../../cron/enums/cron.enum';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class DistributedLockService implements DistributedLock {
  private readonly logger = new Logger(DistributedLockService.name);
  private readonly lockValue = 'locked';
  // private readonly lockTTL = 60000; // TTL in milliseconds

  public constructor(private readonly redisService: RedisService) {}

  public async acquireLock(
    lockKey: CronLockKeyEnum,
    lockTTL?: number,
  ): Promise<boolean> {
    const locked = await this.redisService.getCachedItem(lockKey);
    if (!locked) {
      try {
        const result = await this.redisService.cacheSingle(
          lockKey,
          this.lockValue,
          lockTTL,
        );
        return result === 'locked';
      } catch (e) {
        this.logger.error(e.message);
        throw e;
      }
    }
    return false;
  }

  public async releaseLock(lockKey: CronLockKeyEnum): Promise<void> {
    await this.redisService.removeFromCache(lockKey);
  }
}

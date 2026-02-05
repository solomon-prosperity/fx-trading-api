import { CronLockKeyEnum } from '../../cron/enums/cron.enum';

export interface DistributedLock {
  acquireLock(lockKey: CronLockKeyEnum): Promise<boolean>;

  releaseLock(lockKey: CronLockKeyEnum): Promise<void>;
}

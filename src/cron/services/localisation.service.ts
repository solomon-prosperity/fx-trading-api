import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronLockKeyEnum } from 'src/cron/enums/cron.enum';
import { DistributedLockService } from 'src/distributed-lock/services/distributed-lock.service';
import { CountriesService } from 'src/countries/countries.service';

@Injectable()
export class LocalisationCronService {
  private readonly logger = new Logger(LocalisationCronService.name);
  public constructor(
    private readonly countriesService: CountriesService,
    private readonly distributedLockService: DistributedLockService,
  ) {}

  // Default: '0 */1 * * *' (every hour)
  @Cron(process.env.EXCHANGE_RATE_CRON_SCHEDULE || CronExpression.EVERY_HOUR)
  public async updateExchangeRate(): Promise<void> {
    const lockAcquired = await this.distributedLockService.acquireLock(
      CronLockKeyEnum.UPDATE_EXCHANGE_RATE_JOB_LOCK,
      3600000, // 1 hour
    );
    if (!lockAcquired) {
      this.logger.log(
        'Another instance is already running update exchange rate job.',
      );
      return;
    }
    this.logger.debug(
      'update exchange rate Cron job started by this instance...',
    );
    try {
      await this.countriesService.updateExchangeRate();
      await this.distributedLockService.releaseLock(
        CronLockKeyEnum.UPDATE_EXCHANGE_RATE_JOB_LOCK,
      );
    } catch (error) {
      this.logger.error('Error updating exchange rate', error);
    }
  }
}

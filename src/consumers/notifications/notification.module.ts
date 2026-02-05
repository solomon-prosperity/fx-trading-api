import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationWorkerService } from './notification.worker.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [NotificationService, NotificationWorkerService, ConfigService],
  exports: [NotificationWorkerService],
})
export class NotificationModule {}

import { Module, Global } from '@nestjs/common';
import { NotificationModule } from './notifications/notification.module';
import { ActivitiesModule } from './activities/actvities.module';

@Global()
@Module({
  imports: [NotificationModule, ActivitiesModule],
  providers: [],
  exports: [],
})
export class ConsumersModule {}

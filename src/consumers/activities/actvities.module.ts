import { Module, Global } from '@nestjs/common';
import { ActivityService } from './activities.service';
import { ActivityWorkerService } from './activities.worker.service';
import { ActivityModule } from 'src/activities/activities.module';

@Global()
@Module({
  imports: [ActivityModule],
  providers: [ActivityService, ActivityWorkerService],
  exports: [ActivityWorkerService],
})
export class ActivitiesModule {}

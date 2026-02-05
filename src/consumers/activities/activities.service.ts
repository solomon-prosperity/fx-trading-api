import { Injectable } from '@nestjs/common';
import { ActivitiesServices } from 'src/activities/activities.service';
import {
  ICreateActivity,
} from 'src/common/utils/interfaces';

@Injectable()
export class ActivityService {
  constructor(private readonly activitiesService: ActivitiesServices) {}

  async logActivity(payload: ICreateActivity) {
    const { request, ...rest } = payload;
    await this.activitiesService.create(rest, request);
  }
}

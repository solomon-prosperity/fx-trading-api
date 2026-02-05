import * as UAParser from 'ua-parser-js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Activity } from './entity/activities.entity';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { paginateResult } from 'src/common/helpers';
import { CreateActivityDto } from './dto/create-activity.dto';
import { GetActivitiesDto } from './dto/get-activities.dto';

@Injectable()
export class ActivitiesServices {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    payload: CreateActivityDto,
    request: { ip?: string | string[]; user_agent?: string },
  ) {
    const { event_date, entity, entity_id, ...rest } = payload;
    if (entity === 'user') {
      const user = await this.userRepository.findOne({
        where: { user_id: entity_id },
      });
      if (!user) throw new NotFoundException('User not found');
    } else {
      const admin = await this.adminRepository.findOne({
        where: { admin_id: entity_id },
      });
      if (!admin) throw new NotFoundException('Admin not found');
    }
    let ip_address = request.ip;
    if (Array.isArray(ip_address)) {
      ip_address = ip_address[0];
    }

    const parser = new UAParser.UAParser();
    const userAgent = request.user_agent || '';
    parser.setUA(userAgent);
    const result = parser.getResult();

    const device_info = {
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',
      version: result.browser.version || 'Unknown',
    };
    const savePayload = {
      ...rest,
      entity_id,
      entity,
      event_date,
      ip_address,
      device_info,
    };

    await this.dataSource.transaction(async (manager) => {
      const activity = this.activityRepository.create(savePayload);
      await manager.save(activity);
      return activity;
    });
    return;
  }

  async findAll(payload: GetActivitiesDto) {
    const {
      page = 1,
      limit = 20,
      from,
      to,
      activity_id,
      entity,
      entity_id,
    } = payload;

    const query = this.activityRepository.createQueryBuilder('activities');

    if (activity_id) {
      query.andWhere('activities.activity_id = :activity_id', {
        activity_id,
      });
    }

    if (entity_id) {
      query.andWhere('activities.entity_id = :entity_id', {
        entity_id,
      });
    }

    if (entity) {
      query.andWhere('activities.entity = :entity', {
        entity,
      });
    }

    if (from) {
      query.andWhere('activities.event_date >= :from', { from });
    }

    if (to) {
      query.andWhere('activities.event_date <= :to', { to });
    }

    query.orderBy('activities.event_date', 'DESC');

    const [activities, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const pagination = paginateResult(total, page, limit);
    return { docs: activities, pagination };
  }
}

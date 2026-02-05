import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivitiesServices } from './activities.service';
import { GetOwnActivitiesDto } from './dto/get-own-activities.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('/v1/activities')
export class ActivityController {
  constructor(private readonly activitiesService: ActivitiesServices) {}

  @Get()
  async findAll(
    @Query() query: GetOwnActivitiesDto,
    @CurrentUser() user: User,
  ) {
    const response = await this.activitiesService.findAll({
      ...query,
      entity_id: user.user_id,
      entity: 'user',
    });
    return {
      response,
      message: 'Activities retrieved successfully',
    };
  }
}

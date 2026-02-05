import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Activity } from './entity/activities.entity';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { ActivitiesServices } from './activities.service';
import { ActivityController } from './activities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, User, Admin]), AuthModule],
  controllers: [ActivityController],
  providers: [ActivitiesServices],
  exports: [ActivitiesServices, TypeOrmModule.forFeature([Activity])],
})
export class ActivityModule {}

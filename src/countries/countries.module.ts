import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';
import { Country } from './entities/country.entity';
import { CountriesController } from './countries.controller';
import { CurrencyApiService } from 'src/common/services/currency-api.service';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country, Role, Permission, Admin, User]),
    AuthModule,
    RedisModule,
  ],
  providers: [CountriesService, CurrencyApiService],
  controllers: [CountriesController],
  exports: [
    CountriesService,
    CurrencyApiService,
    TypeOrmModule.forFeature([Country]),
  ],
})
export class CountriesModule {}

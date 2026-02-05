import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Admin } from 'src/admins/entities/admin.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';
import { Country } from 'src/countries/entities/country.entity';
import { CountriesModule } from 'src/countries/countries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Role, Permission, User, Country]),
    CountriesModule,
  ],
  controllers: [],
  providers: [SeederService],
})
export class SeederModule {}

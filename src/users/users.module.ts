import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { WalletsService } from '../wallets/wallets.service';
import { PermissionsService } from '../permissions/permissions.service';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { CountriesModule } from 'src/countries/countries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, Wallet, Transaction]),
    AuthModule,
    TransactionsModule,
    CountriesModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    RabbitmqService,
    RolesService,
    PermissionsService,
    WalletsService,
  ],
  exports: [UsersService, WalletsService],
})
export class UsersModule {}

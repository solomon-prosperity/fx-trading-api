import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { Admin } from './entities/admin.entity';
import { Role } from 'src/roles/entities/role.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersModule } from 'src/users/users.module';
import { ActivityModule } from 'src/activities/activities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Role, Transaction, User]),
    AuthModule,
    UsersModule,
    ActivityModule,
  ],
  controllers: [AdminsController],
  providers: [
    AdminsService,
    RabbitmqService,
    TransactionsService,
    UsersService,
  ],
})
export class AdminsModule {}

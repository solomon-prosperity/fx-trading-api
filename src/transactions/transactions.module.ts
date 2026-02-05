import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction]), AuthModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, RabbitmqService],
  exports: [TransactionsService, TypeOrmModule.forFeature([User, Transaction])],
})
export class TransactionsModule {}

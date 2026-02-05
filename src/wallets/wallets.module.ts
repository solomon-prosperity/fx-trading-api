import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from 'src/users/entities/user.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TransactionsService } from 'src/transactions/transactions.service';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { CountriesModule } from 'src/countries/countries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, User, Transaction]),
    AuthModule,
    CountriesModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService, TransactionsService, RabbitmqService],
  exports: [WalletsService],
})
export class WalletsModule {}

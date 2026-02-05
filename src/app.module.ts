import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { WalletsModule } from './wallets/wallets.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SeederModule } from './seeder/seeder.module';
import { ActivityModule } from './activities/activities.module';
import { CountriesModule } from './countries/countries.module';
import { DistributedLockModule } from './distributed-lock/distributed-lock.module';
import { CronModule } from './cron/cron.module';
import { RedisModule } from './redis/redis.module';
import { ConsumersModule } from './consumers/consumers.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      ignoreEnvFile: false,
    }),
    DatabaseModule,
    RabbitMQModule,
    RedisModule,
    UsersModule,
    RolesModule,
    WalletsModule,
    PermissionsModule,
    AdminsModule,
    AuthModule,
    TransactionsModule,
    SeederModule,
    ActivityModule,
    CountriesModule,
    DistributedLockModule,
    CronModule,
    ConsumersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

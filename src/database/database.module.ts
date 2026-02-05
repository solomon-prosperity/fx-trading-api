import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Admin } from '../admins/entities/admin.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Activity } from '../activities/entity/activities.entity';
import { Country } from '../countries/entities/country.entity';

@Module({
  imports: [
    ConfigModule.forRoot(), // Ensure ConfigModule is available
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'postgres'>('DB_TYPE'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database:
          configService.get<string>('NODE_ENV') === 'test'
            ? configService.get<string>('DB_NAME_TEST')
            : configService.get<string>('DB_NAME'),
        entities: [
          User,
          Permission,
          Role,
          Wallet,
          Admin,
          Transaction,
          Activity,
          Country,
        ],
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
        logging: false,
        migrationsRun: false,
        // ssl: {
        //   rejectUnauthorized: false,
        // },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

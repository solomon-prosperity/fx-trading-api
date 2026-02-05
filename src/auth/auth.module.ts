import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
// import { AdminJwtStrategy } from './admin.jwt.strategy';
import { DatabaseModule } from 'src/database/database.module';
import { User } from 'src/users/entities/user.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from 'src/wallets/wallets.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Admin } from 'src/admins/entities/admin.entity';
import { AdminsService } from 'src/admins/admins.service';
import { Role } from 'src/roles/entities/role.entity';
import { RolesService } from 'src/roles/roles.service';
import { Permission } from 'src/permissions/entities/permission.entity';
import { PermissionsService } from 'src/permissions/permissions.service';
import { Country } from 'src/countries/entities/country.entity';
import { CountriesService } from 'src/countries/countries.service';
import { CurrencyApiService } from 'src/common/services/currency-api.service';
import { RedisService } from 'src/redis/redis.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Wallet,
      Transaction,
      Admin,
      Role,
      Permission,
      Country,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRY_TIME'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    UsersService,
    RabbitmqService,
    WalletsService,
    TransactionsService,
    AdminsService,
    RolesService,
    PermissionsService,
    CountriesService,
    CurrencyApiService,
    RedisService,
  ],
  exports: [
    JwtStrategy,
    PassportModule,
    JwtModule,
    UsersService,
    AdminsService,
    RolesService,
  ],
})
export class AuthModule {}

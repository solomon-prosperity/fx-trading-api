import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { Admin } from '../../admins/entities/admin.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Activity } from '../../activities/entity/activities.entity';
import { Country } from '../../countries/entities/country.entity';

export const connectionSource = new DataSource({
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database:
    process.env.NODE_ENV === 'test'
      ? process.env.DB_NAME_TEST
      : process.env.DB_NAME,
  logging: true,
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
  migrations: [join(__dirname, '/../../', 'database/migrations/**/*{.ts,.js}')],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  migrationsRun: false,
});

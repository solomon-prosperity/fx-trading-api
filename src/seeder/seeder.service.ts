import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Admin } from 'src/admins/entities/admin.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { ConfigService } from '@nestjs/config';
import { Country } from 'src/countries/entities/country.entity';
import { countriesList } from 'src/countries/constants/countries.constant';
import { defaultPermissions } from 'src/seeder/constants/permissions.constants';
import { CountriesService } from 'src/countries/countries.service';
import { UserStatus } from 'src/users/enums/user.enum';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private configService: ConfigService,
    private countriesService: CountriesService,
    private dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.seed();
    } catch (error) {
      this.logger.error(
        'Seeding failed. Application will not start:',
        error.message,
      );
      process.exit(1);
    }
  }

  async seedDefaultSuperAdminRole(manager: EntityManager): Promise<Role> {
    try {
      const role_exists = await manager.findOne(Role, {
        where: { slug: 'super-admin' },
      });
      const permissions = await manager.find(Permission, {});
      if (!role_exists) {
        if (permissions.length === 0) throw new Error('Permissions missing');
        const role = manager.create(Role, {
          name: 'Super Admin',
          slug: 'super-admin',
          description: 'Default Super Admin',
          permissions,
          is_default: true,
        });

        const new_role = await manager.save(role);
        this.logger.log('role created successfully.');
        return new_role;
      } else {
        if (permissions.length > 0) {
          role_exists.permissions = permissions;
          await manager.save(role_exists);
        }
        this.logger.log('role already exists.');
        return role_exists;
      }
    } catch (error) {
      throw error;
    }
  }
  async seedSuperAdmin(manager: EntityManager): Promise<void> {
    try {
      const role = await this.seedDefaultSuperAdminRole(manager);
      const email = this.configService.get('ROOT_ADMIN_EMAIL');
      const password = this.configService.get('ROOT_ADMIN_PASSWORD');
      const admin_exists = await this.adminRepository.findOne({
        where: { email },
      });
      if (!admin_exists) {
        if (!role) throw new Error('Super admin role missing');
        const admin = this.adminRepository.create({
          first_name: 'FX',
          last_name: 'Admin',
          email,
          phone_number: {
            country_code: '+234',
            phone: '1234567890',
          },
          address: {
            house_number: '123',
            street: 'Street',
            lga: 'LGA',
            state: 'State',
            country: 'Country',
          },
          gender: 'male',
          status: UserStatus.ACTIVE,
          is_email_verified: true,
          is_default: true,
          role_id: role.role_id,
          password,
        });

        await manager.save(admin);
        this.logger.log('Admin user created successfully.');
      } else {
        this.logger.log('Admin user already exists.');
      }
    } catch (error) {
      throw error;
    }
  }

  async seedCountries(manager: EntityManager) {
    try {
      const countriesToSeed = countriesList.map((country) => ({
        country: country.country,
        language: country.language,
        cca2: country.cca2,
        ccn3: country.ccn3,
        cca3: country.cca3,
        cioc: country.cioc,
        currency: country.currency,
        currency_symbol: country.currencySymbol,
        currency_code: country.currencyCode,
        flag: country.flag,
        version: 1,
        is_deleted: false,
      }));

      await manager.upsert(Country, countriesToSeed, ['cca2']);

      this.logger.log('🌍 Countries seeded/updated successfully');
    } catch (error) {
      this.logger.error('Failed to seed countries:', error.message);
      throw error;
    }
  }

  async seedPermissions(manager: EntityManager) {
    try {
      await manager.upsert(Permission, defaultPermissions, ['slug']);
      this.logger.log('✅ Permissions seeded/updated successfully');
    } catch (error) {
      this.logger.error('Failed to seed permissions:', error.message);
      throw error;
    }
  }

  async seedExchangeRates() {
    try {
      const country = await this.countriesService.findOne({cca2: 'US'});
      if (!country || !country.exchange_rate) {
        await this.countriesService.updateExchangeRate();
        this.logger.log('Exchange rates updated successfully.');
      }
    } catch (error) {
      this.logger.error('Failed to seed exchange rates:', error.message);
      throw error;
    }
  }

  async seed() {
    try {
      await this.dataSource.transaction(async (manager) => {
        await this.seedPermissions(manager);
        await this.seedSuperAdmin(manager);
        await this.seedCountries(manager);
      });
      await this.seedExchangeRates();
    } catch (error) {
      throw error;
    }
  }
}

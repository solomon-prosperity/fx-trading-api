import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  FindOptionsWhere,
  EntityManager,
  Brackets,
} from 'typeorm';
import { CompleteAdminSignupDto } from './dto/complete-admin-signup.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Admin } from './entities/admin.entity';
import { Role } from 'src/roles/entities/role.entity';
import { generateRandomString, sanitizeString } from '../common/helpers';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { paginateResult } from '../common/helpers';
import { FindManyInterface } from 'src/common/utils/interfaces';
import { GetAdminsDto } from './dto/get-admins-dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private dataSource: DataSource,
    private readonly rabitmqService: RabbitmqService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async inviteAdmin(payload: InviteAdminDto): Promise<Admin> {
    try {
      const response: Admin = await this.dataSource.transaction(
        async (manager) => {
          const { role_id, email } = payload;
          const admin_exist = await this.adminRepository.findOne({
            where: { email },
          });
          if (admin_exist)
            throw new ConflictException('Admin with this email already exists');
          const role = await this.roleRepository.findOne({
            where: { role_id },
          });
          if (!role) throw new NotFoundException('Role not found');
          const admin = manager.save(
            this.adminRepository.create({
              email,
              role_id,
              status: 'inactive',
            }),
          );
          const complete_invite_url = `${this.configService.get(
            'FRONTEND_BASE_URL',
          )}/auth/register/admin?email=${email}`;
          await this.rabitmqService.publishMessage([
            {
              worker: 'notification',
              message: {
                action: 'send',
                type: 'email',
                data: {
                  recipient: email,
                  subject: 'Welcome FX Trading API Admin!',
                  template_id:
                    '2d6f.25986f17b20ef1dd.k1.3c4b0890-0222-11f1-8688-fae9afc80e45.19c2b031799',
                  template_variables: {
                    complete_invite_url,
                    role_name: role.name,
                  },
                  cc: null,
                  bcc: null,
                  attachments: null,
                  is_admin: true,
                },
              },
            },
          ]);
          return admin;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async completeSignup(payload: CompleteAdminSignupDto) {
    try {
      const response = await this.dataSource.transaction(async (manager) => {
        const {
          first_name,
          last_name,
          phone_number,
          country_code,
          gender,
          email,
          password,
        } = payload;
        const admin_exists = await this.adminRepository.findOneBy({
          email,
          status: 'inactive',
        });
        if (!admin_exists)
          throw new ForbiddenException(
            'An admin with this email has not been invited',
          );
        const token = this.jwtService.sign(
          {
            user_id: admin_exists.admin_id,
            user_type: 'admin',
            env: this.configService.get('NODE_ENV'),
            iat: Math.floor(new Date().getTime() / 1000),
          },
          {
            secret: this.configService.get('JWT_ADMIN_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRY_TIME'),
          },
        );
        const login_times = admin_exists.login_times as unknown as Date[];
        login_times.push(new Date());
        const salt = await bcrypt.genSalt(10);
        // update admin record
        const admin = await this.update(
          admin_exists.admin_id,
          {
            first_name,
            last_name,
            phone_number: sanitizeString(phone_number),
            country_code,
            gender,
            email,
            is_email_verified: true,
            is_default: false,
            status: 'active',
            password: await bcrypt.hash(password, salt),
            login_attempts: 0,
            login_times,
          },
          manager,
        );
        await manager.save(admin);
        return { user: admin, token, user_type: 'admin' };
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(
    admin_id: string,
    payload: UpdateProfileDto,
  ): Promise<Admin> {
    try {
      const response: Admin = await this.dataSource.transaction(
        async (manager) => {
          const admin_exists = await this.adminRepository.findOneBy({
            admin_id,
          });
          if (!admin_exists) throw new NotFoundException('Admin not found');
          // update admin record
          const admin = await this.update(
            admin_exists.admin_id,
            {
              ...payload,
            },
            manager,
          );
          await manager.save(admin);
          return admin;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }


  async changePassword(
    admin_id: string,
    payload: ChangePasswordDto,
  ): Promise<Admin> {
    try {
      const response: Admin = await this.dataSource.transaction(
        async (manager) => {
          const admin_exists = await this.adminRepository.findOneBy({
            admin_id,
          });
          if (!admin_exists) throw new NotFoundException('Admin not found');
          const { current_password, new_password } = payload;
          const match = await bcrypt.compare(
            current_password,
            admin_exists.password as string,
          );
          if (!match) throw new ForbiddenException('Invalid current password');
          const hashed_password = await bcrypt.hash(new_password, 12);
          // update admin record
          const admin = await this.update(
            admin_exists.admin_id,
            {
              password: hashed_password,
            },
            manager,
          );
          await manager.save(admin);
          return admin;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findOne(query: FindOptionsWhere<Admin>): Promise<Admin | null> {
    try {
      const admin = await this.adminRepository.findOne({
        where: { ...query },
        relations: ['role'],
      });
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async update(
    admin_id: string,
    payload: Partial<Admin>,
    manager: EntityManager,
  ): Promise<Admin> {
    try {
      const admin = await this.findOne({ admin_id });
      if (!admin) throw new NotFoundException('Admin not found');
      manager.merge(Admin, admin, payload);
      const update_admin = await manager.save(admin);
      return update_admin!;
    } catch (error) {
      throw error;
    }
  }

  async getAdmin(admin_id: string): Promise<Admin> {
    try {
      const admin = await this.findOne({ admin_id });
      if (!admin) throw new NotFoundException('Admin not found');
      return admin!;
    } catch (error) {
      throw error;
    }
  }

  async getAdmins(payload: GetAdminsDto): Promise<FindManyInterface> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        name,
        email,
        start_date,
        end_date,
      } = payload;
      const query = this.adminRepository
        .createQueryBuilder('admin')
        .leftJoinAndSelect('admin.role', 'role');

      if (status) {
        query.andWhere('admin.status = :status', { status });
      }

      if (email) {
        query.andWhere('admin.email = :email', { email });
      }

      if (start_date) {
        query.andWhere('admin.created_at >= :start_date', {
          start_date,
        });
      }

      if (end_date) {
        query.andWhere('admin.created_at <= :end_date', { end_date });
      }

      if (name) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('admin.first_name ILIKE :name', { name: `%${name}%` })
              .orWhere('admin.last_name ILIKE :name', { name: `%${name}%` })
              .orWhere('admin.middle_name ILIKE :name', { name: `%${name}%` });
          }),
        );
      }

      const [admins, total] = await query
        .orderBy('admin.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const pagination = paginateResult(total, page, limit);
      return { docs: admins, pagination };
    } catch (error) {
      throw error;
    }
  }

  async updateWithoutTxn(
    admin_id: string,
    payload: Partial<Admin>,
  ): Promise<Admin> {
    try {
      const admin = await this.findOne({ admin_id });
      if (!admin) throw new NotFoundException('Admin not found');
      this.adminRepository.merge(admin, payload);
      const update_admin = await this.adminRepository.save(admin);
      return update_admin!;
    } catch (error) {
      throw error;
    }
  }
}

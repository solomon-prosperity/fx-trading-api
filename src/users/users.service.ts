import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  FindOptionsWhere,
  EntityManager,
  Brackets,
} from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { User } from './entities/user.entity';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { paginateResult } from '../common/helpers';
import { FindManyInterface } from '../common/utils/interfaces';
import { WalletsService } from '../wallets/wallets.service';
import { ICreateUser, IUpdateUser } from './interfaces/user.interfaces';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { UserStatus } from './enums/user.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    private readonly rabitmqService: RabbitmqService,
    private readonly walletsService: WalletsService,
  ) {}

  async create(payload: ICreateUser, manager: EntityManager) {
    try {
      let user = this.userRepository.create({
        ...payload,
      });
      user = await manager.save(user);

      const wallet = await this.walletsService.create(
        { user, currency: 'NGN' },
        manager,
      );

      user.wallets = [wallet];
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUsers(payload: GetUsersDto): Promise<FindManyInterface> {
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
      const query = this.userRepository.createQueryBuilder('user');

      if (status) {
        query.andWhere('user.status = :status', { status });
      }

      if (email) {
        query.andWhere('user.email = :email', { email });
      }

      if (start_date) {
        query.andWhere('user.created_at >= :start_date', {
          start_date,
        });
      }

      if (end_date) {
        query.andWhere('user.created_at <= :end_date', { end_date });
      }

      if (name) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('user.first_name ILIKE :name', { name: `%${name}%` })
              .orWhere('user.last_name ILIKE :name', { name: `%${name}%` })
              .orWhere('user.middle_name ILIKE :name', { name: `%${name}%` });
          }),
        );
      }

      const [users, total] = await query
        .orderBy('user.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      const pagination = paginateResult(total, page, limit);
      return { docs: users, pagination };
    } catch (error) {
      throw error;
    }
  }

  async findOne(query: FindOptionsWhere<User>): Promise<User | null> {
    try {
      const user = await this.userRepository.findOneBy(query);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUser(query: FindOptionsWhere<User>): Promise<User | null> {
    try {
      const user = await this.findOne(query);
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(
    user_id: string,
    payload: UpdateProfileDto,
  ): Promise<User> {
    try {
      const response: User = await this.dataSource.transaction(
        async (manager) => {
          const user = await this.userRepository.findOneBy({ user_id });
          if (!user) throw new NotFoundException('User not found');
          const updated_user = await this.update(user_id, payload, manager);
          return updated_user;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(
    user_id: string,
    payload: IUpdateUser,
    manager: EntityManager,
  ): Promise<User> {
    try {
      const user = await this.findOne({ user_id });
      if (!user) throw new NotFoundException('User not found');
      manager.merge(User, user, payload);
      const update_user = await manager.save(user);
      return update_user!;
    } catch (error) {
      throw error;
    }
  }

  async updateWithoutTxn(user_id: string, payload: IUpdateUser): Promise<User> {
    try {
      const user = await this.findOne({ user_id });
      if (!user) throw new NotFoundException('User not found');
      this.userRepository.merge(user, payload);
      const update_user = await this.userRepository.save(user);
      return update_user!;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    user_id: string,
    payload: ChangePasswordDto,
    request: Request,
  ): Promise<User> {
    try {
      const response: User = await this.dataSource.transaction(
        async (manager) => {
          const user = await this.userRepository.findOneBy({ user_id });
          if (!user) throw new NotFoundException('User not found');
          const { current_password, new_password } = payload;
          const match = await bcrypt.compare(
            current_password,
            user.password as string,
          );
          if (!match) throw new ForbiddenException('Invalid current password');
          const hashed_password = await bcrypt.hash(new_password, 12);
          const updated_user = await this.update(
            user_id,
            { password: hashed_password },
            manager,
          );
          const request_meta = {
            ip:
              request.ip ||
              request.headers['x-forwarded-for'] ||
              request.socket.remoteAddress,
            user_agent: request.headers['user-agent'],
          };
          await this.rabitmqService.publishMessage([
            {
              worker: 'activity',
              message: {
                action: 'log',
                type: 'activity',
                data: {
                  entity_id: user_id,
                  activity: `${user.first_name} changed their password`,
                  entity: 'user',
                  resource: 'Auth',
                  event: 'Update',
                  event_date: new Date(),
                  request: request_meta,
                },
              },
            },
          ]);
          return updated_user;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteAccount(user_id: string): Promise<User> {
    try {
      const response: User = await this.dataSource.transaction(
        async (manager) => {
          const user = await this.userRepository.findOneBy({ user_id });
          if (!user) throw new NotFoundException('User not found');
          const updated_user = await this.update(
            user_id,
            { status: UserStatus.DELETED },
            manager,
          );
          return updated_user;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUserStatistics() {
    const currentMonth = new Date().getMonth() + 1;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const currentYear = new Date().getFullYear();
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Total users
    const totalUsers = await this.userRepository.count();

    // Users registered in the current month
    const currentMonthUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('EXTRACT(MONTH FROM user.created_at) = :currentMonth', {
        currentMonth,
      })
      .andWhere('EXTRACT(YEAR FROM user.created_at) = :currentYear', {
        currentYear,
      })
      .getCount();

    // Users registered in the last month
    const lastMonthUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('EXTRACT(MONTH FROM user.created_at) = :lastMonth', { lastMonth })
      .andWhere('EXTRACT(YEAR FROM user.created_at) = :lastMonthYear', {
        lastMonthYear,
      })
      .getCount();

    // Calculate percentage change and direction
    const userDifference = currentMonthUsers - lastMonthUsers;
    let percentageChange =
      lastMonthUsers === 0 && currentMonthUsers > lastMonthUsers
        ? 100
        : userDifference === 0
          ? 0
          : (userDifference / lastMonthUsers) * 100;
    percentageChange = parseFloat(percentageChange.toFixed(2));
    const direction =
      userDifference > 0
        ? 'increase'
        : userDifference < 0
          ? 'decrease'
          : 'no change';

    // Total active users
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });

    return {
      totalUsers,
      currentMonthUsers,
      lastMonthUsers,
      userDifference,
      percentageChange,
      direction,
      activeUsers,
    };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { WalletsService } from '../wallets/wallets.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserStatus } from './enums/user.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    user_id: 'user_123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    status: UserStatus.ACTIVE,
  } as User;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
    merge: jest.fn(),
  };

  const mockWalletsService = {
    create: jest.fn(),
  };

  const mockRabbitmqService = {
    publishMessage: jest.fn(),
  };

  const mockEntityManager = {
    save: jest.fn(),
    merge: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: RabbitmqService,
          useValue: mockRabbitmqService,
        },
        {
          provide: WalletsService,
          useValue: mockWalletsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and a wallet', async () => {
      const payload = { first_name: 'John', email: 'john@example.com' } as any;
      mockUserRepository.create.mockReturnValue(mockUser);
      mockEntityManager.save.mockResolvedValue(mockUser);
      mockWalletsService.create.mockResolvedValue({ wallet_id: 'w_1' });

      const result = await service.create(payload, mockEntityManager as any);

      expect(mockUserRepository.create).toHaveBeenCalledWith(payload);
      expect(mockEntityManager.save).toHaveBeenCalledWith(mockUser);
      expect(mockWalletsService.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const payload = {
        page: 1,
        limit: 10,
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.getUsers(payload as any);

      expect(result.docs).toEqual([mockUser]);
      expect(result.pagination.total_count).toBe(1);
    });
  });

  describe('getUser', () => {
    it('should return a user if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      const result = await service.getUser({ user_id: '123' });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.getUser({ user_id: '123' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile within a transaction', async () => {
      const payload = { first_name: 'Updated' };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockEntityManager.save.mockResolvedValue({ ...mockUser, ...payload });

      const result = await service.updateProfile('user_123', payload);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result.first_name).toBe('Updated');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const payload = {
        current_password: 'old',
        new_password: 'new',
        confirm_password: 'new',
      };
      const mockRequest = { ip: '127.0.0.1', headers: {}, socket: {} } as any;

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockEntityManager.save.mockResolvedValue(mockUser);

      const result = await service.changePassword(
        'user_123',
        payload,
        mockRequest,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith('old', mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith('new', 12);
      expect(mockRabbitmqService.publishMessage).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException for invalid current password', async () => {
      const payload = {
        current_password: 'wrong',
        new_password: 'new',
        confirm_password: 'new',
      };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user_123', payload, {} as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteAccount', () => {
    it('should deactivate account', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockEntityManager.save.mockResolvedValue({
        ...mockUser,
        status: UserStatus.DELETED,
      });

      const result = await service.deleteAccount('user_123');

      expect(result.status).toBe(UserStatus.DELETED);
    });
  });

  describe('getUserStatistics', () => {
    it('should return statistics', async () => {
      mockUserRepository.count.mockResolvedValue(100);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(10);

      const result = await service.getUserStatistics();

      expect(result.totalUsers).toBe(100);
      expect(result.activeUsers).toBe(100);
      expect(result.currentMonthUsers).toBe(10);
    });
  });
});

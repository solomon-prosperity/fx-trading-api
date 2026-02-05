import { Test, TestingModule } from '@nestjs/testing';
import { AdminsService } from './admins.service';
import { Admin } from './entities/admin.entity';
import { Role } from 'src/roles/entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AdminsService', () => {
  let service: AdminsService;

  const mockAdmin = {
    admin_id: 'admin_123',
    email: 'admin@example.com',
    password: 'hashed_password',
    status: 'active',
    login_times: [],
  } as any;

  const mockRole = {
    role_id: 'role_123',
    name: 'Super Admin',
  } as any;

  const mockAdminRepository = {
    create: jest.fn().mockReturnValue(mockAdmin),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  const mockRabbitmqService = {
    publishMessage: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock_value'),
  };

  const mockEntityManager = {
    save: jest.fn(),
    merge: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockAdminRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        { provide: RabbitmqService, useValue: mockRabbitmqService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AdminsService>(AdminsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('inviteAdmin', () => {
    it('should successfully invite an admin', async () => {
      const payload = { email: 'new@example.com', role_id: 'role_123' };
      mockAdminRepository.findOne.mockResolvedValue(null);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockEntityManager.save.mockResolvedValue(mockAdmin);

      const result = await service.inviteAdmin(payload);

      expect(mockAdminRepository.findOne).toHaveBeenCalled();
      expect(mockRoleRepository.findOne).toHaveBeenCalled();
      expect(mockRabbitmqService.publishMessage).toHaveBeenCalled();
      expect(result).toEqual(mockAdmin);
    });

    it('should throw ConflictException if admin exists', async () => {
      mockAdminRepository.findOne.mockResolvedValue(mockAdmin);
      await expect(
        service.inviteAdmin({ email: 'e', role_id: 'r' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('completeSignup', () => {
    it('should complete admin signup', async () => {
      const payload = {
        email: 'admin@example.com',
        password: 'password',
        first_name: 'John',
        phone_number: '1234567890',
      } as any;
      mockAdminRepository.findOneBy.mockResolvedValue({
        ...mockAdmin,
        status: 'inactive',
      });
      mockAdminRepository.findOne.mockResolvedValue({
        ...mockAdmin,
        status: 'inactive',
      }); // for update internal call
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockEntityManager.save.mockResolvedValue(mockAdmin);

      const result = await service.completeSignup(payload);

      expect(result.token).toBe('mock_token');
      expect(result.user_type).toBe('admin');
    });

    it('should throw ForbiddenException if not invited', async () => {
      mockAdminRepository.findOneBy.mockResolvedValue(null);
      await expect(
        service.completeSignup({ email: 'e' } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      mockAdminRepository.findOneBy.mockResolvedValue(mockAdmin);
      mockAdminRepository.findOne.mockResolvedValue(mockAdmin); // for update internal call
      mockEntityManager.save.mockResolvedValue({
        ...mockAdmin,
        first_name: 'Updated',
      });

      const result = await service.updateProfile('123', {
        first_name: 'Updated',
      });

      expect(result.first_name).toBe('Updated');
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      mockAdminRepository.findOneBy.mockResolvedValue(mockAdmin);
      mockAdminRepository.findOne.mockResolvedValue(mockAdmin); // for update internal call
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed');
      mockEntityManager.save.mockResolvedValue(mockAdmin);

      const result = await service.changePassword('123', {
        current_password: 'c',
        new_password: 'n',
      });

      expect(result).toBeDefined();
    });
  });

  describe('getAdmins', () => {
    it('should return paginated admins', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockAdmin], 1]),
      };
      mockAdminRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAdmins({
        page: 1,
        limit: 10,
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      });

      expect(result.docs).toHaveLength(1);
    });
  });
});

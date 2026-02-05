import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { AdminsService } from 'src/admins/admins.service';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UserStatus } from 'src/users/enums/user.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateWithoutTxn: jest.fn(),
  };

  const mockAdminsService = {
    findOne: jest.fn(),
    update: jest.fn(),
    updateWithoutTxn: jest.fn(),
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
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: AdminsService, useValue: mockAdminsService },
        { provide: RabbitmqService, useValue: mockRabbitmqService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUpUser', () => {
    it('should successfully sign up a new user', async () => {
      const payload = { email: 'test@example.com', first_name: 'John' } as any;
      mockUsersService.findOne.mockResolvedValue(null); // User doesn't exist
      mockUsersService.create.mockResolvedValue({ ...payload, user_id: '123' });

      const result = await service.signUpUser(payload);

      expect(mockUsersService.findOne).toHaveBeenCalledWith({
        email: payload.email,
      });
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockRabbitmqService.publishMessage).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUsersService.findOne.mockResolvedValue({ email: 'test@example.com' });
      await expect(
        service.signUpUser({ email: 'test@example.com' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('signIn', () => {
    const payload = { email: 'test@example.com', password: 'password' };
    const mockUser = {
      user_id: '123',
      email: 'test@example.com',
      password: 'hashed_password',
      status: UserStatus.ACTIVE,
      login_attempts: 0,
      login_times: [],
    };
    const mockRequest = { ip: '127.0.0.1', headers: {}, socket: {} } as any;

    it('should successfully sign in', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersService.update.mockResolvedValue(mockUser);

      const result = await service.signIn(payload, 'user', mockRequest);

      expect(result).toHaveProperty('token');
      expect(result.user_type).toBe('user');
      expect(mockRabbitmqService.publishMessage).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      await expect(
        service.signIn(payload, 'user', mockRequest),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should lock account after too many attempts', async () => {
      mockUsersService.findOne.mockResolvedValue({
        ...mockUser,
        login_attempts: 5,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockConfigService.get.mockReturnValue(3); // allowed attempts

      await expect(
        service.signIn(payload, 'user', mockRequest),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.updateWithoutTxn).toHaveBeenCalledWith('123', {
        status: UserStatus.LOCKED,
      });
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email', async () => {
      const token = 'token_123';
      const mockUser = {
        user_id: '123',
        is_email_verified: false,
        login_times: [],
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.update.mockResolvedValue({
        ...mockUser,
        is_email_verified: true,
        status: UserStatus.ACTIVE,
      });

      const result = await service.verifyEmail(token);

      expect(result.user.is_email_verified).toBe(true);
      expect(result).toHaveProperty('token');
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      await expect(service.verifyEmail('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

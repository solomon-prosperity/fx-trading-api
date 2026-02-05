import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesServices } from './activities.service';
import { Activity } from './entity/activities.entity';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

jest.mock('ua-parser-js', () => {
  return {
    UAParser: jest.fn().mockImplementation(() => ({
      setUA: jest.fn(),
      getResult: jest.fn().mockReturnValue({
        browser: { name: 'Chrome', version: '1.0' },
        os: { name: 'Windows' },
      }),
    })),
  };
});

describe('ActivitiesServices', () => {
  let service: ActivitiesServices;

  const mockActivity = {
    activity_id: 'act_123',
    event_date: new Date(),
    entity: 'user',
    entity_id: 'user_123',
  } as Activity;

  const mockActivityRepository = {
    create: jest.fn().mockReturnValue(mockActivity),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockAdminRepository = {
    findOne: jest.fn(),
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
        ActivitiesServices,
        {
          provide: getRepositoryToken(Activity),
          useValue: mockActivityRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: mockAdminRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ActivitiesServices>(ActivitiesServices);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const payload = {
      event_date: new Date(),
      entity: 'user',
      entity_id: 'user_123',
      activity: 'login',
    } as any;
    const request = { ip: '127.0.0.1', user_agent: 'test' };

    it('should successfully create an activity for user', async () => {
      mockUserRepository.findOne.mockResolvedValue({ user_id: 'user_123' });
      mockEntityManager.save.mockResolvedValue(mockActivity);

      await service.create(payload, request);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.create(payload, request)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should successfully create an activity for admin', async () => {
      const adminPayload = {
        ...payload,
        entity: 'admin',
        entity_id: 'admin_123',
      };
      mockAdminRepository.findOne.mockResolvedValue({ admin_id: 'admin_123' });
      mockEntityManager.save.mockResolvedValue(mockActivity);

      await service.create(adminPayload, request);

      expect(mockAdminRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated activities', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockActivity], 1]),
      };
      mockActivityRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.docs).toHaveLength(1);
      expect(result.pagination.total_count).toBe(1);
    });
  });
});

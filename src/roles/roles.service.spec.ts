import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

const mockSlugify = jest.fn((name) => name.toLowerCase().replace(/ /g, '-'));
jest.mock('slugify', () => ({
  __esModule: true,
  default: (name: string) => mockSlugify(name),
}));

describe('RolesService', () => {
  let service: RolesService;

  const mockPermission = { permission_id: 'p1', name: 'Perm 1' };
  const mockRole = {
    role_id: '123',
    name: 'Admin',
    slug: 'admin',
    is_default: false,
    permissions: [mockPermission],
    users: [],
  } as any;

  const mockRoleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockPermissionsService = {
    findMany: jest.fn(),
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
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role with permissions', async () => {
      const payload = {
        name: 'Admin',
        permissions: ['p1'],
        description: 'desc',
      };
      mockRoleRepository.findOneBy.mockResolvedValue(null);
      mockPermissionsService.findMany.mockResolvedValue([mockPermission]);
      mockRoleRepository.create.mockReturnValue(mockRole);
      mockEntityManager.save.mockResolvedValue(mockRole);

      const result = await service.create(payload as any);

      expect(mockPermissionsService.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockRole);
    });

    it('should throw ConflictException if role slug exists', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(mockRole);
      await expect(
        service.create({ name: 'Admin', permissions: [] } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if some permissions are missing', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(null);
      mockPermissionsService.findMany.mockResolvedValue([]);
      await expect(
        service.create({ name: 'Admin', permissions: ['missing'] } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated roles', async () => {
      mockRoleRepository.findAndCount.mockResolvedValue([[mockRole], 1]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.docs).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a role', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(mockRole);
      const result = await service.findOne('123');
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const payload = { name: 'New Admin' };
      mockRoleRepository.findOneBy.mockResolvedValue(mockRole);
      mockEntityManager.save.mockResolvedValue({
        ...mockRole,
        name: 'New Admin',
      });

      const result = await service.update('123', payload);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result!.name).toBe('New Admin');
    });

    it('should throw ForbiddenException if role is default', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue({
        ...mockRole,
        is_default: true,
      });
      await expect(service.update('123', {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a role', async () => {
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove('123');
      expect(result).toBe(1);
    });

    it('should throw ForbiddenException if role has users', async () => {
      mockRoleRepository.findOne.mockResolvedValue({
        ...mockRole,
        users: [{}, {}],
      });
      await expect(service.remove('123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getRoleUsers', () => {
    it('should return role with users', async () => {
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      const result = await service.getRoleUsers('123');
      expect(result).toEqual(mockRole);
    });
  });
});

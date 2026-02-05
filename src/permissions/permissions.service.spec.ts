import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PermissionsService', () => {
  let service: PermissionsService;

  const mockPermission = {
    permission_id: '123',
    name: 'View Users',
    slug: 'view-users',
  } as Permission;

  const mockPermissionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    findBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockEntityManager = {
    save: jest.fn(),
    update: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a permission', async () => {
      const payload = { name: 'View Users' };
      mockPermissionRepository.findOneBy.mockResolvedValue(null);
      mockPermissionRepository.create.mockReturnValue(mockPermission);
      mockEntityManager.save.mockResolvedValue(mockPermission);

      const result = await service.create(payload as any);

      expect(mockPermissionRepository.findOneBy).toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(result).toEqual(mockPermission);
    });

    it('should throw ConflictException if permission already exists', async () => {
      mockPermissionRepository.findOneBy.mockResolvedValue(mockPermission);
      await expect(
        service.create({ name: 'View Users' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createMany', () => {
    it('should successfully create multiple permissions', async () => {
      const payload = { permissions: [{ name: 'P1' }, { name: 'P2' }] };
      mockPermissionRepository.findBy.mockResolvedValue([]);
      mockPermissionRepository.create.mockImplementation((p) => p);
      mockEntityManager.save.mockResolvedValue([
        { name: 'p1' },
        { name: 'p2' },
      ]);

      const result = await service.createMany(payload as any);

      expect(mockPermissionRepository.findBy).toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should throw ConflictException if some permissions already exist', async () => {
      mockPermissionRepository.findBy.mockResolvedValue([mockPermission]);
      await expect(
        service.createMany({ permissions: [{ name: 'P1' }] } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated permissions', async () => {
      mockPermissionRepository.findAndCount.mockResolvedValue([
        [mockPermission],
        1,
      ]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.docs).toHaveLength(1);
      expect(result.pagination.total_count).toBe(1);
    });
  });

  describe('findMany', () => {
    it('should return permissions by ids', async () => {
      mockPermissionRepository.findBy.mockResolvedValue([mockPermission]);
      const result = await service.findMany(['123']);
      expect(result).toHaveLength(1);
      expect(mockPermissionRepository.findBy).toHaveBeenCalledWith({
        permission_id: In(['123']),
      });
    });
  });

  describe('findOne', () => {
    it('should return a permission', async () => {
      mockPermissionRepository.findOneBy.mockResolvedValue(mockPermission);
      const result = await service.findOne('123');
      expect(result).toEqual(mockPermission);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPermissionRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      mockPermissionRepository.findOneBy.mockResolvedValue(mockPermission);
      mockEntityManager.update.mockResolvedValue({});
      mockEntityManager.findOneBy.mockResolvedValue({
        ...mockPermission,
        name: 'Updated',
      });

      const result = await service.update('123', { name: 'Updated' });

      expect(mockEntityManager.update).toHaveBeenCalled();
      expect(result!.name).toBe('Updated');
    });

    it('should throw ConflictException if updated name already exists', async () => {
      mockPermissionRepository.findOneBy
        .mockResolvedValueOnce(mockPermission) // find by id
        .mockResolvedValueOnce({ ...mockPermission, permission_id: '456' }); // find by slug (conflict)

      await expect(service.update('123', { name: 'Conflict' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a permission', async () => {
      mockPermissionRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove('123');
      expect(result).toBe(1);
    });

    it('should throw NotFoundException if not found during delete', async () => {
      mockPermissionRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('123')).rejects.toThrow(NotFoundException);
    });
  });
});

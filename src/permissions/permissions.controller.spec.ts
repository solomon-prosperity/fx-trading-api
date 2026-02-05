import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PassportModule } from '@nestjs/passport';

describe('PermissionsController', () => {
  let controller: PermissionsController;

  const mockPermission = {
    permission_id: 'perm_123',
    name: 'View Users',
    slug: 'view-users',
  };

  const mockPermissionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated permissions', async () => {
      mockPermissionsService.findAll.mockResolvedValue({
        docs: [mockPermission],
        pagination: { total_count: 1 },
      });

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(mockPermissionsService.findAll).toHaveBeenCalled();
      expect(result.message).toBe('Permissions retrieved successfully!');
      expect(result.response.docs).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a single permission', async () => {
      mockPermissionsService.findOne.mockResolvedValue(mockPermission);

      const result = await controller.findOne('123');

      expect(mockPermissionsService.findOne).toHaveBeenCalledWith('123');
      expect(result.message).toBe('Permission retrieved successfully!');
      expect(result.response).toEqual(mockPermission);
    });
  });
});

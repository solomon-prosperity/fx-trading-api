import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activities.controller';
import { ActivitiesServices } from './activities.service';
import { PassportModule } from '@nestjs/passport';

describe('ActivityController', () => {
  let controller: ActivityController;

  const mockActivity = {
    activity_id: 'act_123',
    event_date: new Date(),
    entity: 'user',
    entity_id: 'user_123',
  };

  const mockActivitiesService = {
    findAll: jest.fn(),
  };

  const mockUser = {
    user_id: 'user_123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivitiesServices,
          useValue: mockActivitiesService,
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return activities for the current user', async () => {
      mockActivitiesService.findAll.mockResolvedValue({
        docs: [mockActivity],
        pagination: { total_count: 1 },
      });

      const result = await controller.findAll(
        { page: 1, limit: 10 } as any,
        mockUser as any,
      );

      expect(mockActivitiesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        entity_id: mockUser.user_id,
        entity: 'user',
      });
      expect(result.message).toBe('Activities retrieved successfully');
      expect(result.response.docs).toHaveLength(1);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { ActivitiesServices } from 'src/activities/activities.service';
import { PassportModule } from '@nestjs/passport';

describe('AdminsController', () => {
  let controller: AdminsController;

  const mockAdmin = { admin_id: 'admin_123', email: 'admin@example.com' };

  const mockAdminsService = {
    inviteAdmin: jest.fn(),
    getAdmins: jest.fn(),
    completeSignup: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    getAdmin: jest.fn(),
  };

  const mockTransactionsService = {
    adminGetTransactions: jest.fn(),
    adminGetTransaction: jest.fn(),
  };

  const mockUsersService = {
    getUsers: jest.fn(),
    getUserStatistics: jest.fn(),
    getUser: jest.fn(),
  };

  const mockActivitiesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AdminsController],
      providers: [
        { provide: AdminsService, useValue: mockAdminsService },
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: ActivitiesServices, useValue: mockActivitiesService },
      ],
    }).compile();

    controller = module.get<AdminsController>(AdminsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('inviteAdmin', () => {
    it('should invite admin', async () => {
      mockAdminsService.inviteAdmin.mockResolvedValue(mockAdmin);
      const result = await controller.inviteAdmin({ email: 'e', role_id: 'r' });
      expect(result.message).toBe('Admin invited successfully!');
    });
  });

  describe('getAdmins', () => {
    it('should return admins', async () => {
      mockAdminsService.getAdmins.mockResolvedValue({
        docs: [mockAdmin],
        pagination: {},
      });
      const result = await controller.getAdmins({
        page: 1,
        limit: 10,
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      });
      expect(result.message).toBe('Admins retrieved successfully!');
    });
  });

  describe('completeSignup', () => {
    it('should complete signup', async () => {
      mockAdminsService.completeSignup.mockResolvedValue({
        user: mockAdmin,
        token: 't',
      });
      const result = await controller.completeSignup({} as any);
      expect(result.message).toBe('Admin updated successfully!');
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      mockAdminsService.updateProfile.mockResolvedValue(mockAdmin);
      const result = await controller.updateProfile(
        {} as any,
        mockAdmin as any,
      );
      expect(result.message).toBe('Admin updated successfully!');
    });
  });

  describe('getProfile', () => {
    it('should return current admin profile', async () => {
      mockAdminsService.getAdmin.mockResolvedValue(mockAdmin);
      const result = await controller.getProfile(mockAdmin as any);
      expect(result.message).toBe('Admin retrieved successfully!');
    });
  });

  describe('AdminGetTransactions', () => {
    it('should return transactions', async () => {
      mockTransactionsService.adminGetTransactions.mockResolvedValue({
        docs: [],
        pagination: {},
      });
      const result = await controller.AdminGetTransactions({
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      } as any);
      expect(result.message).toBe('Transactions retrieved successfully!');
    });
  });

  describe('GetUsers', () => {
    it('should return users', async () => {
      mockUsersService.getUsers.mockResolvedValue({ docs: [], pagination: {} });
      const result = await controller.GetUsers({
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      } as any);
      expect(result.message).toBe('Users retrieved successfully!');
    });
  });

  describe('getActivities', () => {
    it('should return activities', async () => {
      mockActivitiesService.findAll.mockResolvedValue({
        docs: [],
        pagination: {},
      });
      const result = await controller.getActivities({});
      expect(result.message).toBe('Activities retrieved successfully');
    });
  });
});

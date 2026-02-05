import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PassportModule } from '@nestjs/passport';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    user_id: 'user_123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
  } as User;

  const mockUsersService = {
    getUser: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    deleteAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne (me)', () => {
    it('should return current user profile', async () => {
      mockUsersService.getUser.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser);

      expect(mockUsersService.getUser).toHaveBeenCalledWith({
        user_id: mockUser.user_id,
      });
      expect(result.message).toBe('User retrieved successfully!');
      expect(result.response).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update current user profile', async () => {
      const payload: UpdateProfileDto = { first_name: 'NewName' };
      mockUsersService.updateProfile.mockResolvedValue({
        ...mockUser,
        ...payload,
      });

      const result = await controller.update(mockUser, payload);

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        mockUser.user_id,
        payload,
      );
      expect(result.message).toBe('User updated successfully!');
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const payload: ChangePasswordDto = {
        current_password: 'old',
        new_password: 'new',
      };
      const mockRequest = {} as any;
      mockUsersService.changePassword.mockResolvedValue(mockUser);

      const result = await controller.changePassword(
        mockUser,
        payload,
        mockRequest,
      );

      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        mockUser.user_id,
        payload,
        mockRequest,
      );
      expect(result.message).toBe('Password updated successfully!');
    });
  });

  describe('deleteAccount', () => {
    it('should deactivate user account', async () => {
      mockUsersService.deleteAccount.mockResolvedValue(mockUser);

      const result = await controller.deleteAccount(mockUser);

      expect(mockUsersService.deleteAccount).toHaveBeenCalledWith(
        mockUser.user_id,
      );
      expect(result.message).toBe('Account deactivated successfully!');
    });
  });
});

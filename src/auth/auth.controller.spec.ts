import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin-dto';
import { SignupDto } from './dto/signup-dto';
import { ResendSignUpOtpDto } from './dto/resend-signup-otp-dto';
import { PassportModule } from '@nestjs/passport';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signUpUser: jest.fn(),
    resendEmailConfirmationOtp: jest.fn(),
    signIn: jest.fn(),
    verifyEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUpUser', () => {
    it('should successfully register a user', async () => {
      const payload: SignupDto = { email: 'test@example.com' } as any;
      mockAuthService.signUpUser.mockResolvedValue({
        email: 'test@example.com',
      });

      const result = await controller.signUpUser(payload);

      expect(mockAuthService.signUpUser).toHaveBeenCalledWith(payload);
      expect(result.message).toBe('User created successfully!');
    });
  });

  describe('resendSignUpOtp', () => {
    it('should successfully resend OTP', async () => {
      const payload: ResendSignUpOtpDto = { email: 'test@example.com' };
      mockAuthService.resendEmailConfirmationOtp.mockResolvedValue({});

      const result = await controller.resendSignUpOtp(payload);

      expect(mockAuthService.resendEmailConfirmationOtp).toHaveBeenCalledWith(
        payload,
      );
      expect(result.message).toBe('An OTP has been sent to your email');
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const payload: SigninDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockRequest = {} as any;
      mockAuthService.signIn.mockResolvedValue({ token: 'jwt_token' });

      const result = await controller.signIn(payload, mockRequest);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        payload,
        'user',
        mockRequest,
      );
      expect(result.message).toBe('Signed in successfully!');
    });
  });

  describe('signInAdmin', () => {
    it('should successfully sign in an admin', async () => {
      const payload: SigninDto = {
        email: 'admin@example.com',
        password: 'password',
      };
      const mockRequest = {} as any;
      mockAuthService.signIn.mockResolvedValue({ token: 'jwt_token' });

      const result = await controller.signInAdmin(payload, mockRequest);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        payload,
        'admin',
        mockRequest,
      );
      expect(result.message).toBe('Signed in successfully!');
    });
  });

  describe('confirmation_token', () => {
    it('should successfully verify email token', async () => {
      const token = 'valid_token';
      mockAuthService.verifyEmail.mockResolvedValue({ user_id: '123' });

      const result = await controller.confirmation_token(token);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(token);
      expect(result.message).toBe(
        'User email address has been verified successfully!',
      );
    });
  });
});

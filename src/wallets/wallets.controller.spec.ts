import { Test, TestingModule } from '@nestjs/testing';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { User } from 'src/users/entities/user.entity';
import { TradeAction } from './dto/trade-currency.dto';
import { PassportModule } from '@nestjs/passport';

describe('WalletsController', () => {
  let controller: WalletsController;

  const mockUser = { user_id: 'user_123', email: 'test@example.com' } as User;
  const mockRequest = { ip: '127.0.0.1' } as any;

  const mockWalletsService = {
    getWallets: jest.fn(),
    fundWallet: jest.fn(),
    convertCurrency: jest.fn(),
    trade: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [WalletsController],
      providers: [
        {
          provide: WalletsService,
          useValue: mockWalletsService,
        },
      ],
    }).compile();

    controller = module.get<WalletsController>(WalletsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWallets', () => {
    it('should return wallets', async () => {
      const mockResponse = [{ wallet_id: '1', currency: 'USD', balance: 100 }];
      mockWalletsService.getWallets.mockResolvedValue(mockResponse);

      const result = await controller.getWallets(mockUser, 'USD');

      expect(mockWalletsService.getWallets).toHaveBeenCalledWith(
        mockUser,
        'USD',
      );
      expect(result).toEqual({
        response: mockResponse,
        message: 'Wallets retrieved successfully!',
      });
    });
  });

  describe('fundWallet', () => {
    it('should fund wallet', async () => {
      const payload = { amount: 1000, currency: 'USD' };
      const mockResponse = { transaction_id: 'txn_123' };
      mockWalletsService.fundWallet.mockResolvedValue(mockResponse);

      const result = await controller.fundWallet(
        mockUser,
        payload,
        mockRequest,
      );

      expect(mockWalletsService.fundWallet).toHaveBeenCalledWith(
        mockUser,
        payload,
        mockRequest,
      );
      expect(result).toEqual({
        response: mockResponse,
        message: 'Wallet funded successfully!',
      });
    });
  });

  describe('convertCurrency', () => {
    it('should convert currency', async () => {
      const payload = {
        from_currency: 'USD',
        to_currency: 'NGN',
        amount: 1000,
      };
      const mockResponse = { rate: '1500', converted_amount: 1500000 };
      mockWalletsService.convertCurrency.mockResolvedValue(mockResponse);

      const result = await controller.convertCurrency(
        mockUser,
        payload,
        mockRequest,
      );

      expect(mockWalletsService.convertCurrency).toHaveBeenCalledWith(
        mockUser,
        payload,
        mockRequest,
      );
      expect(result).toEqual({
        response: mockResponse,
        message: 'Currency conversion successful!',
      });
    });
  });

  describe('trade', () => {
    it('should execute trade', async () => {
      const payload = {
        base_currency: 'USD',
        quote_currency: 'NGN',
        amount: 100,
        action: TradeAction.BUY,
      };
      const mockResponse = { debit_transaction: {}, credit_transaction: {} };
      mockWalletsService.trade.mockResolvedValue(mockResponse);

      const result = await controller.trade(mockUser, payload, mockRequest);

      expect(mockWalletsService.trade).toHaveBeenCalledWith(
        mockUser,
        payload,
        mockRequest,
      );
      expect(result).toEqual({
        response: mockResponse,
        message: 'Trade executed successfully!',
      });
    });
  });
});

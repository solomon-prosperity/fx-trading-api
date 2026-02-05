import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { Wallet } from './entities/wallet.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CountriesService } from 'src/countries/countries.service';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { BadRequestException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { TradeAction } from './dto/trade-currency.dto';

describe('WalletsService', () => {
  let service: WalletsService;

  const mockUser = { user_id: 'user_123' } as User;
  const mockWallet = {
    wallet_id: 'wallet_123',
    user_id: 'user_123',
    currency: 'USD',
    balance: 5000,
  } as Wallet;

  const mockWalletRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockCountriesService = {
    convertCurrency: jest.fn(),
    getExchangeRate: jest.fn(),
  };

  const mockRabbitmqService = {
    publishMessage: jest.fn(),
  };

  const mockTransactionsService = {
    create: jest.fn().mockResolvedValue({ transaction_id: 'txn_123' }),
  };

  const mockEntityManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    merge: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest
      .fn()
      .mockImplementation(async (cb) => cb(mockEntityManager)),
  };

  const mockRequest = {
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: CountriesService,
          useValue: mockCountriesService,
        },
        {
          provide: RabbitmqService,
          useValue: mockRabbitmqService,
        },
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fundWallet', () => {
    it('should successfully fund a wallet', async () => {
      const payload = { amount: 10000, currency: 'USD' }; // $100.00
      mockEntityManager.findOne.mockResolvedValue(mockWallet);

      const result = await service.fundWallet(mockUser, payload, mockRequest);

      expect(mockEntityManager.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('convertCurrency', () => {
    it('should successfully convert currency', async () => {
      const payload = {
        from_currency: 'USD',
        to_currency: 'NGN',
        amount: 1000, // $10.00
      };
      mockCountriesService.convertCurrency.mockResolvedValue({
        rate: '1500',
        converted_amount: 15000, // 15,000.00 NGN
      });
      mockEntityManager.findOne.mockResolvedValue(mockWallet);

      const result = await service.convertCurrency(
        mockUser,
        payload,
        mockRequest,
      );

      expect(mockCountriesService.convertCurrency).toHaveBeenCalledWith({
        from: 'USD',
        to: 'NGN',
        amount: 10, // 1000 / 100
      });
      expect(mockEntityManager.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('trade', () => {
    it('should successfully execute a BUY trade', async () => {
      const payload = {
        base_currency: 'USD',
        quote_currency: 'NGN',
        amount: 100, // buying 1.00 USD (in cents)
        action: TradeAction.BUY,
      };

      const mockNgnWallet = { ...mockWallet, currency: 'NGN', balance: 200000 };
      const mockUsdWallet = { ...mockWallet, currency: 'USD', balance: 5000 };

      // 1 NGN = 0.00066667 USD
      mockCountriesService.getExchangeRate.mockResolvedValue(0.00066667);
      mockCountriesService.convertCurrency.mockResolvedValue({
        rate: '0.00066667',
        converted_amount: 1, // 1500.00 NGN * 0.00066667 = 1.00 USD
      });

      mockEntityManager.findOne
        .mockResolvedValueOnce(mockNgnWallet) // from_wallet (NGN)
        .mockResolvedValueOnce(mockUsdWallet) // to_wallet (USD)
        .mockResolvedValueOnce(mockNgnWallet) // for debit operation findOne
        .mockResolvedValueOnce(mockUsdWallet); // for credit operation findOne

      const result = await service.trade(mockUser, payload, mockRequest);

      expect(mockCountriesService.getExchangeRate).toHaveBeenCalledWith(
        'NGN',
        'USD',
      );
      expect(result).toBeDefined();
    });

    it('should successfully execute a SELL trade', async () => {
      const payload = {
        base_currency: 'USD',
        quote_currency: 'NGN',
        amount: 100, // selling 1.00 USD (in cents)
        action: TradeAction.SELL,
      };

      const mockUsdWallet = { ...mockWallet, currency: 'USD', balance: 5000 };
      const mockNgnWallet = { ...mockWallet, currency: 'NGN', balance: 200000 };

      mockCountriesService.convertCurrency.mockResolvedValue({
        rate: '1500',
        converted_amount: 1500, // 1.00 USD * 1500 = 1500.00 NGN
      });

      mockEntityManager.findOne
        .mockResolvedValueOnce(mockUsdWallet) // from_wallet (USD)
        .mockResolvedValueOnce(mockNgnWallet) // to_wallet (NGN)
        .mockResolvedValueOnce(mockUsdWallet) // for debit operation
        .mockResolvedValueOnce(mockNgnWallet); // for credit operation

      const result = await service.trade(mockUser, payload, mockRequest);

      expect(mockCountriesService.convertCurrency).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if rate retrieval fails', async () => {
      const payload = {
        base_currency: 'USD',
        quote_currency: 'NGN',
        amount: 100,
        action: TradeAction.BUY,
      };

      mockCountriesService.getExchangeRate.mockResolvedValue(null);

      await expect(
        service.trade(mockUser, payload, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { User } from 'src/users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const mockUser = { user_id: 'user_123' } as User;

  const mockTransactionsService = {
    getTransactions: jest.fn(),
    getTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return transactions', async () => {
      const mockResponse = { docs: [], pagination: {} };
      const query = {
        page: 1,
        limit: 20,
        start_date: '2023-01-01',
        end_date: '2023-01-02',
      };
      mockTransactionsService.getTransactions.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser, query as any);

      expect(mockTransactionsService.getTransactions).toHaveBeenCalledWith(
        mockUser.user_id,
        query,
      );
      expect(result).toEqual({
        response: mockResponse,
        message: 'Transactions retrieved successfully!',
      });
    });
  });

  describe('getTransaction', () => {
    it('should return a transaction', async () => {
      const mockResponse = { transaction_id: 'txn_123' };
      mockTransactionsService.getTransaction.mockResolvedValue(mockResponse);

      const result = await controller.getTransaction('txn_123', mockUser);

      expect(mockTransactionsService.getTransaction).toHaveBeenCalledWith(
        mockUser.user_id,
        'txn_123',
      );
      expect(result).toEqual({
        response: mockResponse,
        message: 'Transaction retrieved successfully!',
      });
    });
  });
});

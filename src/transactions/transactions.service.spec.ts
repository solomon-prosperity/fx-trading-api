import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  TransactionFlow,
  TransactionStatus,
  TransactionType,
} from './enums/transaction.enum';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: Repository<Transaction>;
  let dataSource: DataSource;

  const mockTransaction = {
    transaction_id: 'uuid',
    user_id: 'user_id',
    amount: 1000,
    currency: 'NGN',
    reference: 'ref',
    status: TransactionStatus.COMPLETED,
    type: TransactionType.FUNDING,
    flow: TransactionFlow.CREDIT,
  } as Transaction;

  const mockRepository = {
    create: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
    }),
  };

  const mockEntityManager = {
    save: jest.fn(),
    merge: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a transaction', async () => {
      const payload = { amount: 1000 } as any;
      mockRepository.create.mockReturnValue(mockTransaction);
      mockEntityManager.save.mockResolvedValue(mockTransaction);

      const result = await service.create(payload, mockEntityManager as any);

      expect(repository.create).toHaveBeenCalledWith(payload);
      expect(mockEntityManager.save).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('findOne', () => {
    it('should return a transaction if found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockTransaction);

      const result = await service.findOne({ transaction_id: 'uuid' });

      expect(repository.findOneBy).toHaveBeenCalledWith({
        transaction_id: 'uuid',
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne({ transaction_id: 'uuid' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions for a user', async () => {
      const payload = {
        page: 1,
        limit: 10,
        start_date: undefined,
        end_date: undefined,
      } as any;
      const result = await service.getTransactions('user_id', payload);

      expect(result.docs).toEqual([mockTransaction]);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('createTransaction', () => {
    it('should wrap creation in a database transaction', async () => {
      const payload = { amount: 1000 } as any;
      mockDataSource.transaction.mockImplementation(async (cb) =>
        cb(mockEntityManager),
      );
      mockRepository.create.mockReturnValue(mockTransaction);
      mockEntityManager.save.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction(payload);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });
  });
});

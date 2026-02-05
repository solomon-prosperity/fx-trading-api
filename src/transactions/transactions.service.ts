import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  EntityManager,
  FindOptionsWhere,
} from 'typeorm';
import { paginateResult } from '../common/helpers';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';
import { FindManyInterface } from 'src/common/utils/interfaces';
import {
  ICreateTransaction,
  IUpdateTransaction,
} from './interfaces/transaction.interfaces';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { AdminGetTransactionsDto } from './dto/admin-get-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async create(
    payload: ICreateTransaction,
    manager: EntityManager,
  ): Promise<Transaction> {
    try {
      const transaction = this.transactionRepository.create({
        ...payload,
      });
      await manager.save(transaction);
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  async findOne(
    query: FindOptionsWhere<Transaction>,
  ): Promise<Transaction | null> {
    try {
      const transaction = await this.transactionRepository.findOneBy(query);
      if (!transaction) throw new NotFoundException('Transaction not found');
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  async findAll(payload: GetTransactionsDto): Promise<FindManyInterface> {
    try {
      const { page = 1, limit = 20 } = payload;
      const [transactions, total] =
        await this.transactionRepository.findAndCount({
          skip: (page - 1) * limit,
          take: limit,
        });
      const pagination = paginateResult(total, page, limit);
      return { docs: transactions, pagination };
    } catch (error) {
      throw error;
    }
  }

  async update(
    transaction_id: string,
    payload: IUpdateTransaction,
    manager: EntityManager,
  ): Promise<Transaction> {
    try {
      const transaction = await this.findOne({ transaction_id });
      if (!transaction) throw new NotFoundException('Transaction not found');
      manager.merge(Transaction, transaction, payload);
      const update_transaction = await manager.save(transaction);
      return update_transaction!;
    } catch (error) {
      throw error;
    }
  }

  async createTransaction(payload: ICreateTransaction): Promise<Transaction> {
    try {
      const response: Transaction = await this.dataSource.transaction(
        async (manager) => {
          const transaction = await this.create(payload, manager);
          return transaction;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateTransaction(
    transaction_id: string,
    payload: IUpdateTransaction,
  ): Promise<Transaction> {
    try {
      const response: Transaction = await this.dataSource.transaction(
        async (manager) => {
          const transaction = await this.findOne({ transaction_id });
          if (!transaction)
            throw new NotFoundException('Transaction not found');
          const updated_transaction = await this.update(
            transaction_id,
            { ...payload },
            manager,
          );
          return updated_transaction;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }


  async getTransaction(
    user_id: string,
    transaction_id: string,
  ): Promise<Transaction | null> {
    try {
      const transaction = await this.findOne({
        transaction_id,
        user_id,
      });
      if (!transaction) throw new NotFoundException('Transaction not found');
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  async getTransactions(
    user_id: string,
    payload: GetTransactionsDto,
  ): Promise<FindManyInterface> {
    try {
      const {
        page = 1,
        limit = 20,
        reference,
        type,
        start_date,
        end_date,
      } = payload;

      const query = this.transactionRepository
        .createQueryBuilder('transactions')
        .where('transactions.user_id = :user_id', {
          user_id,
        });

      // Filters
      if (type) {
        query.andWhere('transactions.type = :type', { type });
      }

      if (reference) {
        query.andWhere('transactions.reference = :reference', { reference });
      }
      if (start_date) {
        query.andWhere('transactions.created_at >= :start_date', {
          start_date,
        });
      }

      if (end_date) {
        query.andWhere('transactions.created_at <= :end_date', { end_date });
      }

      query.orderBy('transactions.created_at', 'DESC');
      const [transactions, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const pagination = paginateResult(total, page, limit);
      return { docs: transactions, pagination };
    } catch (error) {
      throw error;
    }
  }

  async adminGetTransactions(
    payload: AdminGetTransactionsDto,
  ): Promise<FindManyInterface> {
    try {
      const {
        page = 1,
        limit = 20,
        reference,
        type,
        session_id,
        product_id,
        operator_id,
        user_id,
        is_transfer,
        flow,
        status,
        start_date,
        end_date,
      } = payload;

      const query = this.transactionRepository
        .createQueryBuilder('transactions')
        .leftJoin('transactions.user', 'user')
        .addSelect(['user.first_name', 'user.last_name', 'user.middle_name']) // Select user fields
        .where('1 = 1'); // Placeholder condition to append dynamic filters

      // Filters
      if (user_id) {
        query.andWhere('transactions.user_id = :user_id', { user_id });
      }

      if (session_id) {
        query.andWhere('transactions.session_id = :session_id', { session_id });
      }

      if (product_id) {
        query.andWhere('transactions.product_id = :product_id', { product_id });
      }

      if (is_transfer) {
        query.andWhere('transactions.is_transfer = :is_transfer', {
          is_transfer,
        });
      }

      if (flow) {
        query.andWhere('transactions.flow = :flow', { flow });
      }

      if (status) {
        query.andWhere('transactions.status = :status', { status });
      }

      if (operator_id) {
        query.andWhere('transactions.operator_id = :operator_id', {
          operator_id,
        });
      }

      if (type) {
        query.andWhere('transactions.type = :type', { type });
      }

      if (reference) {
        query.andWhere('transactions.reference = :reference', { reference });
      }

      if (start_date) {
        query.andWhere('transactions.created_at >= :start_date', {
          start_date,
        });
      }

      if (end_date) {
        query.andWhere('transactions.created_at <= :end_date', { end_date });
      }

      query.orderBy('transactions.created_at', 'DESC');

      const [transactions, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const pagination = paginateResult(total, page, limit);
      return { docs: transactions, pagination };
    } catch (error) {
      throw error;
    }
  }

  async adminGetTransaction(
    transaction_id: string,
  ): Promise<Transaction | null> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { transaction_id },
        relations: ['user'],
      });
      if (!transaction) throw new NotFoundException('Transaction not found');
      return transaction;
    } catch (error) {
      throw error;
    }
  }
}

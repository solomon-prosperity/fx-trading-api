import { User } from 'src/users/entities/user.entity';
import { EntityManager } from 'typeorm';
import { TransactionType } from 'src/transactions/enums/transaction.enum';

export interface ICreateWallet {
  user: User;
  currency: string;
}

export interface IUpdateWallet {
  balance: number;
}

export interface IDebitWallet {
  wallet_id: string;
  amount: number;
  exchange_rate: string;
  manager: EntityManager;
  description?: string;
  type: TransactionType;
  metadata?: object;
}

export interface ICreditWallet {
  wallet_id: string;
  amount: number;
  exchange_rate: string;
  manager: EntityManager;
  description?: string;
  type: TransactionType;
  metadata?: object;
}

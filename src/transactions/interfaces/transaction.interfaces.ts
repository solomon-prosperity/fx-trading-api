import {
  TransactionFlow,
  TransactionStatus,
  TransactionType,
} from '../enums/transaction.enum';

export interface IUpdateTransaction {
  status?: TransactionStatus;
  session_id?: string;
  is_disputed?: boolean;
  dispute_details?: string;
  dispute_resources?: string[];
}

export interface ICreateTransaction {
  user_id: string;
  wallet_id: string;
  session_id?: string;
  type: TransactionType;
  amount: number;
  exchange_rate: string;
  currency: string;
  reference: string;
  flow: TransactionFlow;
  status: TransactionStatus;
  description?: string;
}

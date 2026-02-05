export enum TransactionStatus {
  PENDING = 'pending',
  ABANDONED = 'abandoned',
  FAILED = 'failed',
  COMPLETED = 'completed',
  SUCCESS = 'success',
  REVERSED = 'reversed',
}

export enum TransactionType {
  FUNDING = 'funding',
  CONVERSION = 'conversion',
  TRADE = 'trade',
  WITHDRAWAL = 'withdrawal',
  FEE = 'fee',
}

export enum TransactionFlow {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

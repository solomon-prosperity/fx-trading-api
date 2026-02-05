export interface IVpayApiResponse<T = object> {
  status: string;
  message: string;
  data: T;
}

export interface IVpayAccessTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface ICreateVpayIndividualAccount {
  bvn: string;
  dateOfBirth: string;
}

export interface ICreateVpayIndividualAccountResponse {
  firstname: string;
  middlename: string;
  lastname: string;
  bvn: string;
  phone: string;
  dob: string;
  accountNo: string;
}

export interface ICreateVpayCorporateAccount {
  rcNumber: string;
  companyName: string;
  incorporationDate: string;
  bvn: string;
}

export interface ICreateVpayCorporateAccountResponse {
  accountNo: string;
  accountName: string;
}

export interface IVpayAccountEnquiryResponse {
  accountNo: string;
  accountBalance: string;
  accountId: string;
  client: string;
  clientId: string;
  savingsProductName: string;
}

export interface IVpayBeneficiaryEnquiry {
  accountNo: string;
  bank: string;
  transfer_type: string;
}

export interface IVpayBeneficiaryEnquiryResponse {
  name: string;
  bvn: string;
  account: {
    number: string;
    id: string;
  };
  status: string;
  clientId: string;
  currency: string;
  bank: string;
}

export interface IVpayTransfer {
  fromAccount: string;
  uniqueSenderAccountId?: string;
  fromClientId: string;
  fromClient: string;
  fromSavingsId: string;
  fromBvn?: string;
  toClientId?: string;
  toClient: string;
  toSavingsId?: string;
  toSession?: string;
  toBvn?: string;
  toAccount: string;
  toBank: string;
  amount: string;
  remark: string;
  transferType: string;
  reference: string;
}

export interface IVpayTransferResponse {
  txnId: string;
  sessionId: string;
  reference: string;
}

export interface IVpayAccountsEnquiry {
  entity: string;
  size: string;
  page: string;
}

export interface IVpayAccountsEnquiryContent {
  lastName: string;
  phone: string;
  firstName: string;
  createdDate: string;
  clientId: string;
  bvn: string;
  accountNo: string;
  accountBalance: string;
}

export interface IVpayAccountsEnquiryResponse {
  content: IVpayAccountsEnquiryContent[];
  totalElements: number;
  totalPages: number;
}

export interface IVpayAccountTransactions {
  accountNo: string;
  startDate: string;
  endDate: string;
  transactionType: string;
  size?: string;
  page?: string;
}

export interface IVpayAccountTransactionsResponse {
  accountNo: string;
  receiptNumber: string;
  amount: string;
  remarks: string;
  createdDate: string;
  transactionType: string;
  runningBalance: string;
  currencyCode: string;
  id: string;
}

export interface IVpayTransactionStatusResponse {
  TxnId: string;
  amount: string;
  accountNo: string;
  fromAccountNo: string;
  transactionStatus: string;
  transactionDate: string;
  toBank: string;
  fromBank: string;
  sessionId: string;
  bankTransactionId: string;
  transactionType: string;
}

export interface IVpayTransactionReversalStatusResponse {
  TxnId: string;
  amount: string;
  accountNo: string;
  transactionStatus: string;
  transactionDate: string;
  toBank: string;
  fromBank: string;
  sessionId: string;
  bankTransactionId: string;
}

export interface ICreatePaystackTransferRecipient {
  name: string;
  account_number: string;
  bank_code: string;
  currency: string;
  metadata: {
    account_name: string;
  };
}

export interface IInitiatePaystackTransfer {
  amount: number;
  recipient: string;
  reference: string;
  reason?: string;
}

export interface ICreatePaystackTransferRecipientResponse {
  active: boolean;
  createdAt: string;
  currency: string;
  domain: string;
  id: number;
  integration: number;
  name: string;
  recipient_code: string;
  type: string;
  updatedAt: string;
  is_deleted: boolean;
  details: {
    authorization_code: string | null;
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
  };
}

export interface IInitiatePaystackTransferResponse {
  status: string;
  message: string;
  data: {
    integration?: number;
    domain?: string;
    amount?: number;
    currency?: string;
    source?: string;
    reason?: string;
    recipient?: number;
    status: string;
    transfer_code: string;
    id?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface IVerifyPaystackTransactionResponse {
  amount: number;
  createdAt: string;
  currency: string;
  domain: string;
  failures: null | string;
  id: number;
  integration: number;
  reason: string;
  reference: string;
  source: string;
  source_details: null | string;
  status: string;
  titan_code: null | string;
  transfer_code: string;
  request: number;
  transferred_at: null | string;
  updatedAt: string;
  recipient: {
    active: boolean;
    createdAt: string;
    currency: string;
    description: null | string;
    domain: string;
    email: string;
    id: number;
    integration: number;
    metadata: {
      custom_fields: {
        display_name: string;
        variable_name: string;
        value: string;
      }[];
    };
    name: string;
    recipient_code: string;
    type: string;
    updatedAt: string;
    is_deleted: boolean;
    isDeleted: boolean;
    details: {
      authorization_code: null | string;
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
    };
  };
  session: {
    provider: null | string;
    id: string;
  };
  customer: ICustomer;
  authorization: IAuthorization;
  fee_charged: number;
  fees_breakdown: null | string;
  gateway_response: null | string;
}

export interface IAuthorization {
  authorization_code: string;
  account_name: string;
  bin: string;
  last4: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  reusable: boolean;
  signature: string;
}

export interface IPaystackResolveAccountPayload {
  bank_code: string;
  account_number: string;
}

export interface IPaystackResolveAccountResponse {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export interface IPaystackBalanceResponse {
  currency: string;
  balance: number;
}
export interface IPaystackApiResponse<T = object> {
  status: string;
  message: string;
  data: T;
}
interface ICustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: string;
  risk_action: string;
  international_format_phone: string | null;
}

interface Bank {
  name: string;
  id: number;
  slug: string;
}

interface SplitConfig {
  subaccount: string;
}

export interface IPaystackGetDVAResponse {
  id: number;
  account_name: string;
  account_number: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  currency: string;
  split_config: SplitConfig;
  active: boolean;
  assigned: boolean;
  customer: ICustomer;
  bank: Bank;
}

export enum PaystackCurrency {
  NGN = 'NGN',
  USD = 'USD',
  GHS = 'GHS',
  ZAR = 'ZAR',
  KES = 'KES',
  XOF = 'XOF',
}

export enum PaystackTransactionChannel {
  BANK = 'bank',
  CARD = 'card',
}

export interface IPaystackInitiateTransactionPayload {
  amount: number;
  email: string;
  reference: string;
  message: string;
  currency: PaystackCurrency;
  channels: PaystackTransactionChannel[];
  metadata?: {
    custom_fields: {
      display_name: string;
      variable_name: string;
      value: string;
    }[];
  };
}

export interface IPaystackInitiateTransactionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface IPaystackChargeCardPayload {
  amount: number;
  email: string;
  reference: string;
  currency: PaystackCurrency;
  authorization_code: string;
  metadata?: {
    custom_fields: {
      display_name: string;
      variable_name: string;
      value: string;
    }[];
  };
}

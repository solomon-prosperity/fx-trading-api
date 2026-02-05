import { Request } from 'express';
export interface ResponseMessageInterface {
  status_code: number;
  message: Array<string>;
  data: object;
}

export interface QueueTopologyInterface {
  queue: string;
  exchange: string;
  routing_key: string;
}

export interface MessageInterface {
  action: string;
  type: string;
  data: object;
}

export interface MessagePublisherInterface {
  worker: string;
  message: MessageInterface;
}

export interface FindManyInterface {
  docs: Array<object>;
  pagination: PaginationResultInterface;
}

export interface ErrorMessagesInterface {
  field: string;
  errors: Array<string>;
}

export interface ErrorsInterface {
  message: Array<ErrorMessagesInterface>;
}

export interface PaginationResultInterface {
  count: number;
  total_count: number;
  prev_page: number | null;
  current_page: number;
  next_page: number | null;
  total_pages: number;
  out_of_range: boolean;
}

export interface ResponseInterface {
  response?: {
    pagination?: PaginationResultInterface;
    docs?: Array<object>;
  };
  message?: string;
}

export interface IGenerateClientAssertionPayload {
  base_url: string;
  client_id: string;
  private_key: string;
  iss: string;
}

export interface CurrencyApiResponse {
  meta: { last_updated_at: string };
  data: Record<string, { code: string; value: number }>;
}

export interface IpInfoApiResponse {
  ip: string;
  asn: string;
  as_name: string;
  as_domain: string;
  country_code: string;
  country: string;
  continent_code: string;
  continent: string;
}

export interface ResponseMessageInterface {
  status_code: number;
  message: Array<string>;
  data: object;
}

export interface QueueTopologyInterface {
  queue: string;
  exchange: string;
  routing_key: string;
}

export interface MessageInterface {
  action: string;
  type: string;
  data: object;
}

export interface MessagePublisherInterface {
  worker: string;
  message: MessageInterface;
}

export interface SendSmsInterface {
  from?: string;
  message: string;
  phone_number: string;
}

export interface PerformKYCInterface {
  type: string;
  value: string;
  is_id_image: boolean;
  user_id?: string;
  user_type?: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  state?: string;
  lga?: string;
}

export interface IdentityPassPayloadInterface {
  number?: string;
  image?: string;
  id_image_url?: string;
  number_nin?: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  state?: string;
  lga?: string;
}

export interface UpdateKycStatusInterface {
  is_identity_verified: boolean;
  reason_for_failed_verification?: string;
  verification_status: string;
  identity_verification_report: object;
}

export interface KycResultInterface {
  status: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  photo: string;
}

export interface VerifyUserIdentityInterface {
  user_id: string;
  user_type: string;
  id_type: string;
  result: KycResultInterface;
}

export interface IEmail {
  email: string;
  name?: string;
}

export interface IAttachment {
  file_url: string;
  file_name: string;
}

export interface IDownloadAsBase64Result {
  base_64_data: string;
  mime_type: string | boolean;
}

export interface IEmailOptions {
  recipient: string;
  subject: string;
  reply_to_email: string;
  allow_to_reply: boolean;
  send_attachment: boolean;
  template_id: string;
  template_variables: object;
  cc?: IEmail[];
  bcc?: IEmail[];
  attachments?: IAttachment[];
}

export interface INotificationMessage {
  action: string;
  type: string;
  data: IEmailOptions;
}

export interface ICreateActivity {
  entity_id: string;
  entity: string;
  activity: string;
  resource: string;
  event: string;
  event_date: string;
  request: Request;
}

export interface ICreateAdminActivity {
  entity_id: string;
  entity: string;
  activity: string;
  resource: string;
  event: string;
  event_date: string;
  ip_address?: string;
  device_info?: object;
  request: Request;
}

export interface IActivityMessage {
  action: string;
  type: string;
  data: ICreateActivity;
}

export interface CacheItemsInterface {
  key: string;
  data: string;
}
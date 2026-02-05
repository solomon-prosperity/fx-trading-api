import { UserStatus, Gender } from '../enums/user.enum';

interface PhoneNumber {
  country_code: string;
  phone: string;
}

export interface Address {
  house_number: string;
  street: string;
  landmark?: string;
  lga: string;
  state: string;
  country: string;
  zip_code?: string;
  is_address_verified?: boolean;
}

export interface ICreateUser {
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone_number: PhoneNumber;
  password: string;
  status?: UserStatus;
  email_confirmation_token?: string;
  email_confirmation_sent_at?: number;
  email_confirmation_expires_at?: number;
}

export interface IUpdateUser {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone_number?: PhoneNumber;
  password?: string;
  email_confirmation_token?: string;
  email_confirmation_sent_at?: number;
  email_confirmation_expires_at?: number;
  is_email_verified?: boolean;
  gender?: Gender;
  status?: UserStatus;
  jti?: string;
  address_info?: Address;
  reset_password_token?: string;
  reset_password_token_expires?: number;
  login_times?: Date[];
  login_attempts?: number;
  password_changed_at?: number;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { UserStatus, Gender } from '../../users/enums/user.enum';

export class PhoneNumber {
  @Column({ nullable: true })
  country_code: string;

  @Column({ nullable: true })
  phone: string;
}

export class AddressInfo {
  @Column({ nullable: true })
  house_number: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  landmark?: string;

  @Column({ nullable: true })
  lga: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  zip_code?: string;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  middle_name?: string;

  @Column(() => PhoneNumber)
  phone_number: PhoneNumber;

  @Column(() => AddressInfo)
  address_info: AddressInfo;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ unique: true })
  email_confirmation_token: string;

  @Exclude()
  @Column({ type: 'bigint', nullable: false })
  email_confirmation_sent_at: number;

  @Exclude()
  @Column({ type: 'bigint', nullable: false })
  email_confirmation_expires_at: number;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  status: UserStatus;

  @Exclude()
  @Column()
  password: string;

  @Exclude()
  @Column('simple-array', { nullable: true, default: [] })
  login_times: Date[];

  @Column({ default: 0 })
  login_attempts: number;

  @Exclude()
  @Column({ type: 'bigint', nullable: true })
  password_changed_at: number;

  @Exclude()
  @Column({ nullable: true, default: null })
  reset_password_token: string;

  @Exclude()
  @Column({ type: 'bigint', nullable: true })
  reset_password_token_expires: number;

  @OneToMany(() => Wallet, (wallet) => wallet.user, {
    cascade: true,
  })
  wallets: Wallet[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  async hash_password() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}

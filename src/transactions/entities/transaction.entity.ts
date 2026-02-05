import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import {
  TransactionStatus,
  TransactionType,
  TransactionFlow,
} from '../enums/transaction.enum';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @Column()
  user_id: string;

  @Column()
  wallet_id: string;

  @Column({ nullable: true })
  session_id?: string;

  @Column()
  currency: string;

  @Column()
  reference: string;

  @Column()
  amount: number;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.FUNDING,
  })
  type: TransactionType;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
  })
  exchange_rate: string;

  @Column({ type: 'enum', enum: TransactionFlow })
  flow: TransactionFlow;

  @Column({ default: false })
  is_transfer: boolean;

  @Column({ default: false })
  is_disputed: boolean;

  @Column({ type: 'text', nullable: true })
  dispute_details?: string;

  @Column({ type: 'simple-array', nullable: true })
  dispute_resources?: string[];

  @ManyToOne(() => User, (user) => user.transactions, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @Column({ type: 'json', nullable: true })
  metadata?: object;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

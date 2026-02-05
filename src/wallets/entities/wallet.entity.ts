import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JoinColumn } from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  wallet_id: string;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: 'NGN' })
  currency: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.wallets, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

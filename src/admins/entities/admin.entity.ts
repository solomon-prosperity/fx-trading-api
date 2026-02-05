import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../roles/entities/role.entity';
import { Exclude } from 'class-transformer';

@Entity('admin_users')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  admin_id: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ nullable: true })
  first_name: string;

  @Exclude()
  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  country_code: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'not_set'],
    default: 'not_set',
  })
  gender: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active',
  })
  status: string;

  @Column({ nullable: true })
  image: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Exclude()
  @Column({ type: 'bigint', nullable: true })
  password_changed_at: number;

  @Exclude()
  @Column('simple-array', { nullable: true, default: [] })
  login_times: Date[];

  @Column({ default: 0 })
  login_attempts: number;

  @Column({ nullable: true })
  reset_password_token: string;

  @Column({ nullable: true })
  reset_password_sent_at: Date;

  @Exclude()
  @Column({ type: 'bigint', nullable: true })
  reset_password_token_expires: number;

  @Exclude()
  @Column({ nullable: true })
  jti: string;

  @Column({ default: false })
  is_default: boolean;

  @Column({ nullable: true })
  role_id: string;

  @ManyToOne(() => Role)
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'role_id',
  })
  role: Role;

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

  @BeforeInsert()
  set_default_values() {
    this.status = this.status || 'active';
    this.full_name = `${this.first_name} ${this.last_name}`;
  }
}

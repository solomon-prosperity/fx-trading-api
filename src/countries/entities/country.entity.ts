import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('country')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ type: 'varchar' })
  public country: string;

  @Column({ type: 'varchar', nullable: true })
  public country_code: string;

  @Column({ type: 'varchar' })
  public language: string;

  @Column({ type: 'varchar', unique: true })
  public cca2: string;

  @Column({ type: 'varchar', nullable: true })
  public ccn3: string;

  @Column({ type: 'varchar' })
  public cca3: string;

  @Column({ type: 'varchar', nullable: true })
  public cioc: string;

  @Column({ type: 'varchar' })
  public currency: string;

  @Column({ type: 'varchar' })
  public currency_symbol: string;

  @Column({ type: 'varchar' })
  public flag: string;

  @Column({ type: 'bigint' })
  public version: number;

  @Column({ type: 'boolean' })
  public is_deleted: boolean;

  @Column({ type: 'varchar', nullable: true })
  public exchange_rate?: string;

  @Column({ type: 'varchar', nullable: true })
  public currency_code?: string;

  @CreateDateColumn()
  public created_at: Date;

  @UpdateDateColumn()
  public updated_at: Date;
}

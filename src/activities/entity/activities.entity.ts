import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

class DeviceInfo {
  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  os: string;

  @Column({ nullable: true })
  version: string;
}

@Entity({ name: 'activities' }) // The table name in the database
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  activity_id: string;

  @Column({ type: 'varchar' })
  entity_id: string;

  @Column({ type: 'varchar', enum: ['admin', 'user'] })
  entity: string;

  @Column({ type: 'varchar' })
  resource: string;

  @Column({ type: 'varchar' })
  event: string;

  @Column({ type: 'varchar' })
  activity: string;

  @Column({ type: 'varchar' })
  ip_address: string;

  @Column(() => DeviceInfo)
  device_info: DeviceInfo;

  @Column({ type: 'timestamp' })
  event_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

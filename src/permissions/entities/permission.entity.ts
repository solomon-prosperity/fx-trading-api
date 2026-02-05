import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  permission_id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  entity: string;

  @Column()
  action: string;

  @Column()
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

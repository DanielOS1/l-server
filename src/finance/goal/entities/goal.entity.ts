import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../../group/group/entities/group.entity';
import { Sale } from '../../sale/entities/sale.entity';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 200, nullable: true })
  purpose: string;

  @Column('decimal', { precision: 12, scale: 2 })
  targetAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  currentAmount: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Group, (group) => group.goals)
  group: Group;

  @OneToMany(() => Sale, (sale) => sale.goal)
  sales: Sale[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

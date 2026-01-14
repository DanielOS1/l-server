import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Goal } from '../../goal/entities/goal.entity';
import { SaleColumn } from '../../sale-column/entities/sale-column.entity';
import { SaleRow } from '../../sale-row/entities/sale-row.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ length: 200, nullable: true })
  location: string;

  @ManyToOne(() => Goal, (goal) => goal.sales, { onDelete: 'CASCADE' })
  goal: Goal;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @OneToMany(() => SaleColumn, (column) => column.sale)
  columns: SaleColumn[];

  @OneToMany(() => SaleRow, (row) => row.sale)
  rows: SaleRow[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

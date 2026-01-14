import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Sale } from '../../sale/entities/sale.entity';
import { SaleValue } from './sale-value.entity';
import { User } from '../../../user/entities/user.entity';

@Entity('sale_rows')
export class SaleRow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (sale) => sale.rows, { onDelete: 'CASCADE' })
  sale: Sale;

  @ManyToOne(() => User, { nullable: true })
  addedBy: User;

  @Column({ nullable: true })
  addedByUserId: string;

  @OneToMany(() => SaleValue, (value) => value.row, { cascade: true })
  values: SaleValue[];

  @CreateDateColumn()
  createdAt: Date;
}

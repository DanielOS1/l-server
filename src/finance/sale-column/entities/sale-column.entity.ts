import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Sale } from '../../sale/entities/sale.entity';
import { SaleValue } from '../../sale-row/entities/sale-value.entity';

export enum SaleColumnType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
}

@Entity('sale_columns')
export class SaleColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: SaleColumnType })
  type: SaleColumnType;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: false })
  isFunctionalAmount: boolean; // Marks if this column represents the monetary amount for calculations

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @ManyToOne(() => Sale, (sale) => sale.columns, { onDelete: 'CASCADE' })
  sale: Sale;

  @OneToMany(() => SaleValue, (value) => value.column)
  values: SaleValue[];
}

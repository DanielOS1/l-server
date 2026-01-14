import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SaleRow } from './sale-row.entity';
import { SaleColumn } from '../../sale-column/entities/sale-column.entity';

@Entity('sale_values')
export class SaleValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  value: string; // We store everything as string and parse based on column type

  @ManyToOne(() => SaleRow, (row) => row.values, { onDelete: 'CASCADE' })
  row: SaleRow;

  @ManyToOne(() => SaleColumn, (column) => column.values, {
    onDelete: 'RESTRICT',
  })
  column: SaleColumn;
}

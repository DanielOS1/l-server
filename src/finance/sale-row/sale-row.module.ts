import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleRow } from './entities/sale-row.entity';
import { SaleValue } from './entities/sale-value.entity';
import { SaleRowService } from './sale-row.service';
import { SaleRowController } from './sale-row.controller';
import { Sale } from '../sale/entities/sale.entity';
import { SaleColumn } from '../sale-column/entities/sale-column.entity';
import { User } from '../../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleRow, SaleValue, Sale, SaleColumn, User]),
  ],
  controllers: [SaleRowController],
  providers: [SaleRowService],
  exports: [SaleRowService],
})
export class SaleRowModule {}

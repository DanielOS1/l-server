import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleColumn } from './entities/sale-column.entity';
import { SaleColumnService } from './sale-column.service';
import { SaleColumnController } from './sale-column.controller';
import { Sale } from '../sale/entities/sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SaleColumn, Sale])],
  controllers: [SaleColumnController],
  providers: [SaleColumnService],
  exports: [SaleColumnService],
})
export class SaleColumnModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { Goal } from '../../finance/goal/entities/goal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Goal])],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}

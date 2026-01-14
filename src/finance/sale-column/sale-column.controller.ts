import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SaleColumnService } from './sale-column.service';
import { CreateSaleColumnDto } from './dto/create-sale-column.dto';
import { SaleColumn } from './entities/sale-column.entity';

@Controller('sale-column')
export class SaleColumnController {
  constructor(private readonly saleColumnService: SaleColumnService) {}

  @Post()
  create(
    @Body() createSaleColumnDto: CreateSaleColumnDto,
  ): Promise<SaleColumn> {
    return this.saleColumnService.create(createSaleColumnDto);
  }

  @Get()
  findAll(@Query('saleId') saleId: string): Promise<SaleColumn[]> {
    if (!saleId) throw new BadRequestException('saleId is required');
    return this.saleColumnService.findAllBySale(saleId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.saleColumnService.remove(id);
  }
}

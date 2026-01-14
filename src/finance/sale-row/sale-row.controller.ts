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
import { SaleRowService } from './sale-row.service';
import { CreateSaleRowDto } from './dto/create-sale-row.dto';
import { SaleRow } from './entities/sale-row.entity';

@Controller('sale-row')
export class SaleRowController {
  constructor(private readonly saleRowService: SaleRowService) {}

  @Post()
  create(@Body() createSaleRowDto: CreateSaleRowDto): Promise<SaleRow> {
    return this.saleRowService.create(createSaleRowDto);
  }

  @Get()
  findAll(@Query('saleId') saleId: string): Promise<SaleRow[]> {
    if (!saleId) throw new BadRequestException('saleId is required');
    return this.saleRowService.findAllBySale(saleId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.saleRowService.remove(id);
  }
}

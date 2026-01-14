import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
    return this.saleService.create(createSaleDto);
  }

  @Get()
  findAll(@Query('goalId') goalId: string): Promise<Sale[]> {
    if (!goalId) throw new BadRequestException('goalId is required');
    return this.saleService.findAllByGoal(goalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Sale> {
    return this.saleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
  ): Promise<Sale> {
    return this.saleService.update(id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.saleService.remove(id);
  }
}

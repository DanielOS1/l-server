import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Request,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';

@Controller('sale')
@UseGuards(AuthGuard('jwt'))
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  create(
    @Body() createSaleDto: CreateSaleDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Sale> {
    return this.saleService.create(createSaleDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('goalId') goalId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Sale[]> {
    if (!goalId) throw new BadRequestException('goalId is required');
    return this.saleService.findAllByGoal(goalId, req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Sale> {
    return this.saleService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Sale> {
    return this.saleService.update(id, updateSaleDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.saleService.remove(id, req.user.userId);
  }
}

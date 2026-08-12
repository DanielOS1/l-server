import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Request,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { SaleRowService } from './sale-row.service';
import { CreateSaleRowDto } from './dto/create-sale-row.dto';
import { SaleRow } from './entities/sale-row.entity';

@Controller('sale-row')
@UseGuards(AuthGuard('jwt'))
export class SaleRowController {
  constructor(private readonly saleRowService: SaleRowService) {}

  @Post()
  create(
    @Body() createSaleRowDto: CreateSaleRowDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<SaleRow> {
    return this.saleRowService.create(createSaleRowDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('saleId') saleId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<SaleRow[]> {
    if (!saleId) throw new BadRequestException('saleId is required');
    return this.saleRowService.findAllBySale(saleId, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.saleRowService.remove(id, req.user.userId);
  }
}

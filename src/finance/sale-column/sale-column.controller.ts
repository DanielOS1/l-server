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
import { SaleColumnService } from './sale-column.service';
import { CreateSaleColumnDto } from './dto/create-sale-column.dto';
import { SaleColumn } from './entities/sale-column.entity';

@Controller('sale-column')
@UseGuards(AuthGuard('jwt'))
export class SaleColumnController {
  constructor(private readonly saleColumnService: SaleColumnService) {}

  @Post()
  create(
    @Body() createSaleColumnDto: CreateSaleColumnDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<SaleColumn> {
    return this.saleColumnService.create(createSaleColumnDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('saleId') saleId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<SaleColumn[]> {
    if (!saleId) throw new BadRequestException('saleId is required');
    return this.saleColumnService.findAllBySale(saleId, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.saleColumnService.remove(id, req.user.userId);
  }
}

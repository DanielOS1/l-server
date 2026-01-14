import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleColumn } from './entities/sale-column.entity';
import { CreateSaleColumnDto } from './dto/create-sale-column.dto';
import { Sale } from '../sale/entities/sale.entity';

@Injectable()
export class SaleColumnService {
  constructor(
    @InjectRepository(SaleColumn)
    private readonly saleColumnRepository: Repository<SaleColumn>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async create(createSaleColumnDto: CreateSaleColumnDto): Promise<SaleColumn> {
    const { saleId } = createSaleColumnDto;
    const sale = await this.saleRepository.findOne({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Sale not found');

    const column = this.saleColumnRepository.create({
      ...createSaleColumnDto,
      sale,
    });
    return this.saleColumnRepository.save(column);
  }

  async findAllBySale(saleId: string): Promise<SaleColumn[]> {
    return this.saleColumnRepository.find({
      where: { sale: { id: saleId } },
      order: { orderIndex: 'ASC' },
    });
  }

  async remove(id: string): Promise<void> {
    const column = await this.saleColumnRepository.findOne({ where: { id } });
    if (!column) throw new NotFoundException('Column not found');
    await this.saleColumnRepository.remove(column); // Cascade delete values is redundant if handled by DB, but good to know
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleColumn } from './entities/sale-column.entity';
import { CreateSaleColumnDto } from './dto/create-sale-column.dto';
import { Sale } from '../sale/entities/sale.entity';
import { GroupAccessService } from '../../common/group-access/group-access.service';

@Injectable()
export class SaleColumnService {
  constructor(
    @InjectRepository(SaleColumn)
    private readonly saleColumnRepository: Repository<SaleColumn>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    private readonly groupAccessService: GroupAccessService,
  ) {}

  async create(
    createSaleColumnDto: CreateSaleColumnDto,
    userId: string,
  ): Promise<SaleColumn> {
    const { saleId } = createSaleColumnDto;
    const sale = await this.saleRepository.findOne({
      where: { id: saleId },
      relations: ['goal', 'goal.group'],
    });
    if (!sale) throw new NotFoundException('Sale not found');
    await this.groupAccessService.assertMember(userId, sale.goal.group.id);

    const column = this.saleColumnRepository.create({
      ...createSaleColumnDto,
      sale,
    });
    return this.saleColumnRepository.save(column);
  }

  async findAllBySale(saleId: string, userId: string): Promise<SaleColumn[]> {
    const sale = await this.saleRepository.findOne({
      where: { id: saleId },
      relations: ['goal', 'goal.group'],
    });
    if (!sale) throw new NotFoundException('Sale not found');
    await this.groupAccessService.assertMember(userId, sale.goal.group.id);

    return this.saleColumnRepository.find({
      where: { sale: { id: saleId } },
      order: { orderIndex: 'ASC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const column = await this.saleColumnRepository.findOne({
      where: { id },
      relations: ['sale', 'sale.goal', 'sale.goal.group'],
    });
    if (!column) throw new NotFoundException('Column not found');
    await this.groupAccessService.assertMember(
      userId,
      column.sale.goal.group.id,
    );
    await this.saleColumnRepository.remove(column); // Cascade delete values is redundant if handled by DB, but good to know
  }
}

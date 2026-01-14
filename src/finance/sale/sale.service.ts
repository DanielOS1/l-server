import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Goal } from '../../finance/goal/entities/goal.entity';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const { goalId } = createSaleDto;
    const goal = await this.goalRepository.findOne({ where: { id: goalId } });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const sale = this.saleRepository.create({
      ...createSaleDto,
      goal,
    });
    return this.saleRepository.save(sale);
  }

  async findAllByGoal(goalId: string): Promise<Sale[]> {
    return this.saleRepository.find({
      where: { goal: { id: goalId } },
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['goal'],
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);
    Object.assign(sale, updateSaleDto);
    return this.saleRepository.save(sale);
  }

  async remove(id: string): Promise<void> {
    const sale = await this.findOne(id);
    await this.saleRepository.remove(sale);
  }
}

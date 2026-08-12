import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Goal } from '../../finance/goal/entities/goal.entity';
import { GroupAccessService } from '../../common/group-access/group-access.service';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    private readonly groupAccessService: GroupAccessService,
  ) {}

  async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
    const { goalId } = createSaleDto;
    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['group'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    await this.groupAccessService.assertMember(userId, goal.group.id);

    const sale = this.saleRepository.create({
      ...createSaleDto,
      goal,
    });
    return this.saleRepository.save(sale);
  }

  async findAllByGoal(goalId: string, userId: string): Promise<Sale[]> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['group'],
    });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    await this.groupAccessService.assertMember(userId, goal.group.id);

    return this.saleRepository.find({
      where: { goal: { id: goalId } },
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['goal', 'goal.group'],
    });
    if (!sale) throw new NotFoundException('Sale not found');
    await this.groupAccessService.assertMember(userId, sale.goal.group.id);
    return sale;
  }

  async update(
    id: string,
    updateSaleDto: UpdateSaleDto,
    userId: string,
  ): Promise<Sale> {
    const sale = await this.findOne(id, userId);
    Object.assign(sale, updateSaleDto);
    return this.saleRepository.save(sale);
  }

  async remove(id: string, userId: string): Promise<void> {
    const sale = await this.findOne(id, userId);
    await this.saleRepository.remove(sale);
  }
}

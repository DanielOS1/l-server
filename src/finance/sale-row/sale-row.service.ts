import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SaleRow } from './entities/sale-row.entity';
import { SaleValue } from './entities/sale-value.entity';
import { CreateSaleRowDto } from './dto/create-sale-row.dto';
import { Sale } from '../../finance/sale/entities/sale.entity';
import {
  SaleColumn,
  SaleColumnType,
} from '../../finance/sale-column/entities/sale-column.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class SaleRowService {
  constructor(
    @InjectRepository(SaleRow)
    private readonly saleRowRepository: Repository<SaleRow>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleColumn)
    private readonly saleColumnRepository: Repository<SaleColumn>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createSaleRowDto: CreateSaleRowDto): Promise<SaleRow> {
    const { saleId, addedByUserId, values } = createSaleRowDto;

    const sale = await this.saleRepository.findOne({
      where: { id: saleId },
      relations: ['columns'],
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const user = await this.userRepository.findOne({
      where: { id: addedByUserId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Validate values against columns
    const columnsMap = new Map(sale.columns.map((c) => [c.id, c]));
    const processedValues: SaleValue[] = [];
    let amountToAdd = 0;

    for (const entry of values) {
      const column = columnsMap.get(entry.columnId);
      if (!column)
        throw new BadRequestException(
          `Column ${entry.columnId} does not belong to this sale`,
        );

      // Type validation (simple)
      if (column.type === SaleColumnType.NUMBER) {
        if (isNaN(Number(entry.value))) {
          throw new BadRequestException(
            `Value for column ${column.name} must be a number`,
          );
        }
        if (column.isFunctionalAmount) {
          amountToAdd += Number(entry.value);
        }
      }
      // Date and Text validation can be added here

      const val = new SaleValue();
      val.column = column;
      val.value = entry.value;
      processedValues.push(val);
    }

    // Required columns check
    for (const col of sale.columns) {
      if (col.isRequired && !values.find((v) => v.columnId === col.id)) {
        throw new BadRequestException(`Column ${col.name} is required`);
      }
    }

    // Transaction to save row, values and update sale total
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const row = new SaleRow();
      row.sale = sale;
      row.addedBy = user;
      row.addedByUserId = addedByUserId;
      const savedRow = await queryRunner.manager.save(row);

      for (const val of processedValues) {
        val.row = savedRow;
        await queryRunner.manager.save(val);
      }

      if (amountToAdd !== 0) {
        sale.totalAmount = Number(sale.totalAmount) + amountToAdd;
        await queryRunner.manager.save(sale);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedRow.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllBySale(saleId: string): Promise<SaleRow[]> {
    return this.saleRowRepository.find({
      where: { sale: { id: saleId } },
      relations: ['values', 'values.column', 'addedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SaleRow> {
    const row = await this.saleRowRepository.findOne({
      where: { id },
      relations: ['values', 'values.column', 'addedBy'],
    });
    if (!row) throw new NotFoundException(`SaleRow #${id} not found`);
    return row;
  }

  async remove(id: string): Promise<void> {
    // Must implement logic to decrease totalAmount before deleting
    // For MVP we might skip this or implement it carefully.
    // Let's implement basic total reduction.

    const row = await this.findOne(id);
    if (!row) throw new NotFoundException('Row not found');

    // Calculate amount to subtract
    let amountToSubtract = 0;
    for (const val of row.values) {
      if (
        val.column.isFunctionalAmount &&
        val.column.type === SaleColumnType.NUMBER
      ) {
        amountToSubtract += Number(val.value);
      }
    }

    if (amountToSubtract !== 0) {
      const sale = await this.saleRepository.findOne({
        where: { id: row.sale.id },
      }); // Assuming relations are not loaded in row.sale
      if (sale) {
        sale.totalAmount = Number(sale.totalAmount) - amountToSubtract;
        await this.saleRepository.save(sale);
      }
    }

    await this.saleRowRepository.remove(row);
  }
}

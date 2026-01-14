import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { SaleColumnType } from '../entities/sale-column.entity';

export class CreateSaleColumnDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEnum(SaleColumnType)
  @IsNotEmpty()
  type: SaleColumnType;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  isFunctionalAmount?: boolean;

  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @IsUUID()
  @IsNotEmpty()
  saleId: string;
}

import {
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleValueEntryDto {
  @IsUUID()
  @IsNotEmpty()
  columnId: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateSaleRowDto {
  @IsUUID()
  @IsNotEmpty()
  saleId: string;

  @IsUUID()
  @IsNotEmpty()
  addedByUserId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleValueEntryDto)
  values: CreateSaleValueEntryDto[];
}

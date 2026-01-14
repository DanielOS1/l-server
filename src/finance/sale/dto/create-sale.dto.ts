import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
  IsISO8601,
} from 'class-validator';

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @IsUUID()
  @IsNotEmpty()
  goalId: string;
}

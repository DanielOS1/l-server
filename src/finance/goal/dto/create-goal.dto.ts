import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  MaxLength,
  IsISO8601,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  purpose?: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  targetAmount: number;

  @IsISO8601()
  @IsNotEmpty()
  startDate: Date;

  @IsISO8601()
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}

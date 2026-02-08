import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  IsISO8601,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActivityPositionDto {
  @IsUUID()
  @IsNotEmpty()
  positionId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsISO8601()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  semesterId: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityPositionDto)
  activityPositions?: CreateActivityPositionDto[];
}

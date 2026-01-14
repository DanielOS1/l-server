import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  IsISO8601,
  IsOptional,
} from 'class-validator';

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
}

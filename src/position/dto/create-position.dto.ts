import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  semesterId: string;
}

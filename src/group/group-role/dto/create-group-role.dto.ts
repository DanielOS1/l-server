import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateGroupRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsUUID()
  @IsNotEmpty()
  groupId!: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  level?: number;
}

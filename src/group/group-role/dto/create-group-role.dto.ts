import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateGroupRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}

import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(255)
  description: string;

  @IsUUID()
  @IsNotEmpty()
  createdById: string;
}

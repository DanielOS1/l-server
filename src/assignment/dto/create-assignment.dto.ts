import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  activityId: string;

  @IsUUID()
  @IsNotEmpty()
  positionId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

import { IsNotEmpty, IsString, IsUUID, MaxLength, IsDate } from 'class-validator';

export class CreateSemesterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}

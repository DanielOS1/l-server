import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { NoticeLevel } from '../entities/notice.entity';

export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(NoticeLevel)
  @IsOptional()
  level?: NoticeLevel;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsBoolean()
  @IsOptional()
  isSent?: boolean;
}

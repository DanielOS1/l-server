import { IsString, IsUUID, IsOptional, IsBoolean, IsEmail, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export class UserDto {
    @IsUUID()
    id: string;
  
    @IsString()
    firstName: string;
  
    @IsString()
    lastName: string;
  
    @IsEmail()
    email: string;
  }
  
export class UserGroupDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  groupRole: any; // Using any to avoid complex circular imports, or define a GroupRoleDto here if needed

  @IsBoolean()
  isCreator: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;
}



export class GroupResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  extraData: any;

  @IsString()
  createdAt: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserGroupDto)
  userGroups: UserGroupDto[];

  @IsOptional()
  @IsArray()
  semesters: any[];
}
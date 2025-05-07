import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEmail,
    IsDateString,
    MinLength,
    Length,
  } from 'class-validator';
  
  export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    firstName: string;
  
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    lastName: string;
  
    @IsString()
    @IsNotEmpty()
    @Length(6, 20)
    rut: string;
  
    @IsString()
    @IsOptional()
    @Length(0, 100)
    occupation?: string;
  
    @IsString()
    @IsOptional()
    @Length(0, 20)
    phone?: string;
  
    @IsString()
    @IsOptional()
    @Length(0, 200)
    address?: string;
  
    @IsDateString()
    @IsOptional()
    birthDate?: Date;
  
    @IsEmail()
    email: string;
  
    @IsString()
    @MinLength(6)
    password: string;
  }
  
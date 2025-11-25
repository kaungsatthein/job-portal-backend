import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsUrl,
  IsDateString,
} from 'class-validator';
import { Status, UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BaseUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  nrc?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

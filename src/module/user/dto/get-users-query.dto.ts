import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status, UserRole } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Filter by role' })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ enum: Status, description: 'Filter by status' })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}

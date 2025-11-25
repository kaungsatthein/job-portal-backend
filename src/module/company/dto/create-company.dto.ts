// create-company.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Industry ID', required: false })
  @IsOptional()
  @IsString()
  industryId?: string;

  @ApiProperty({ description: 'Job status', enum: JobStatus, required: false })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { JobType, JobStatus } from '@prisma/client';

export class CreateJobPostingDto {
  @ApiProperty({ description: 'Recruiter ID' })
  @IsNotEmpty()
  @IsString()
  recruiterId: string;

  @ApiProperty({ description: 'Company ID' })
  @IsNotEmpty()
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Job title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Job description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Job type', enum: JobType })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({ description: 'Job location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Salary range', required: false })
  @IsOptional()
  @IsString()
  salaryRange?: string;

  @ApiProperty({ description: 'Job status', enum: JobStatus, required: false })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}

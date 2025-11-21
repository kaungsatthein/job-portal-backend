import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'ID of the researcher applying',
    example: 'uuid-of-researcher',
  })
  @IsString()
  @IsNotEmpty()
  researcherId: string;

  @ApiProperty({
    description: 'ID of the job posting',
    example: 'uuid-of-job-posting',
  })
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({
    description: 'Initial status of the application',
    enum: ApplicationStatus,
    example: ApplicationStatus.submitted,
    required: false,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus = ApplicationStatus.submitted;
}

import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.reviewed,
    description: 'Update application status',
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

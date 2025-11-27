import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'job_update', description: 'Type of notification' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Your job application has been updated.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'user-id-123', description: 'Recipient user ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  applicationId?: string;
}

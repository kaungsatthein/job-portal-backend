import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: Status,
    example: Status.DELETE,
    description: 'Update application status',
  })
  @IsEnum(Status)
  status: Status;
}

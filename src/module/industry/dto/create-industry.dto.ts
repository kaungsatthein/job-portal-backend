import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty({
    description: 'Name of the industry',
    example: 'Information Technology',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}

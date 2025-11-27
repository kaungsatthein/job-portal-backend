import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({ example: true })
  read: boolean;
}

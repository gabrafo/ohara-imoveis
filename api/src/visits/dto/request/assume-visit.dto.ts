import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AssumeVisitDto {
  @ApiProperty({ description: 'ID do corretor que assume a visita', example: 3 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  brokerId: number;

  visitId?: number;
} 
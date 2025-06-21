import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional({ example: '2024-12-15T14:30:00Z', description: 'Nova data/hora da visita' })
  @IsOptional()
  @IsDateString({}, { message: 'A data deve estar em formato ISO 8601' })
  visitDateTime?: string;
} 
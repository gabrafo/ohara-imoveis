import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { VisitStatus } from '../../../common/enums/visit-status.enum';

export class UpdateVisitDto {
  @ApiPropertyOptional({ example: '2024-12-15T14:30:00Z', description: 'Nova data/hora da visita' })
  @IsOptional()
  @IsDateString({}, { message: 'A data deve estar em formato ISO 8601' })
  visitDateTime?: string;

  @ApiPropertyOptional({ enum: VisitStatus, description: 'Novo status da visita' })
  @IsOptional()
  @IsEnum(VisitStatus, { message: 'Status inválido' })
  visitStatus?: VisitStatus;
} 
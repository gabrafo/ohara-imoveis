import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class ScheduleVisitDto {
  @ApiProperty({
    description: 'Data e hora da visita',
    example: '2023-12-15T14:30:00Z',
  })
  @IsNotEmpty({ message: 'A data e hora da visita são obrigatórias' })
  @IsDateString({}, { message: 'A data e hora devem estar em formato ISO 8601' })
  visitDateTime: string;

  @ApiProperty({
    description: 'ID do usuário que agendou a visita',
    example: 1,
  })
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório' })
  @IsInt({ message: 'O ID do cliente deve ser um número inteiro' })
  @IsPositive({ message: 'O ID do cliente deve ser positivo' })
  customerId: number;

  @ApiProperty({
    description: 'ID da propriedade a ser visitada',
    example: 1,
  })
  @IsNotEmpty({ message: 'O ID da propriedade é obrigatório' })
  @IsInt({ message: 'O ID da propriedade deve ser um número inteiro' })
  @IsPositive({ message: 'O ID da propriedade deve ser positivo' })
  propertyId: number;
} 


import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreatePropertyFeatureDto {
  @ApiProperty({
    description: 'ID da propriedade',
    example: 1,
  })
  @IsNotEmpty({ message: 'O ID da propriedade é obrigatório' })
  @IsInt({ message: 'O ID da propriedade deve ser um número inteiro' })
  @IsPositive({ message: 'O ID da propriedade deve ser positivo' })
  propertyId: number;

  @ApiProperty({
    description: 'ID do tipo de característica',
    example: 1,
  })
  @IsNotEmpty({ message: 'O ID do tipo de característica é obrigatório' })
  @IsInt({ message: 'O ID do tipo de característica deve ser um número inteiro' })
  @IsPositive({ message: 'O ID do tipo de característica deve ser positivo' })
  featureTypeId: number;

  @ApiProperty({
    description: 'Quantidade da característica (ex: 3 quartos)',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'A quantidade deve ser um número inteiro' })
  @IsPositive({ message: 'A quantidade deve ser positiva' })
  quantity?: number;

  @ApiProperty({
    description: 'Detalhes adicionais sobre a característica',
    example: 'Quarto principal com suíte',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Os detalhes devem ser uma string' })
  @MaxLength(255, { message: 'Os detalhes devem ter no máximo 255 caracteres' })
  details?: string;
} 
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeatureTypeDto {
  @ApiProperty({
    description: 'Nome da característica (ex: Quartos, Banheiros, Área)',
    example: 'Quartos',
  })
  @IsNotEmpty({ message: 'O nome da característica é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  @MaxLength(50, { message: 'O nome deve ter no máximo 50 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Unidade de medida da característica (ex: m², unidades)',
    example: 'm²',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A unidade deve ser uma string' })
  @MaxLength(20, { message: 'A unidade deve ter no máximo 20 caracteres' })
  unit?: string;

  @ApiProperty({
    description: 'Indica se a característica permite quantidade (ex: 3 quartos)',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'O campo allowsQuantity deve ser um booleano' })
  allowsQuantity?: boolean;
} 
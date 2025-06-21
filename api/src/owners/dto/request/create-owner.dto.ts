import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsPhoneNumber } from 'class-validator';
import { IsCPF } from '../../../common/validators/is-cpf.validator';

export class CreateOwnerDto {
  @ApiProperty({ example: 'João da Silva', description: 'Nome completo do proprietário' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '(11) 91234-5678', description: 'Telefone de contato do proprietário' })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('BR', { message: 'O número de telefone fornecido não é válido.' })
  contactPhone: string;

  @ApiPropertyOptional({ example: '123.456.789-00', description: 'CPF do proprietário (opcional)' })
  @IsString()
  @IsCPF({ message: 'CPF inválido.' })
  cpf: string;
} 
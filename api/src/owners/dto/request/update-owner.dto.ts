
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsPhoneNumber } from 'class-validator';
import { IsCPF } from '../../../common/validators/is-cpf.validator';

export class UpdateOwnerDto {
  @ApiPropertyOptional({ example: 'João da Silva', description: 'Nome completo do proprietário' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: '(11) 91234-5678', description: 'Telefone de contato do proprietário' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('BR', { message: 'O número de telefone fornecido não é válido.' })
  contactPhone?: string;

  @ApiPropertyOptional({ example: '123.456.789-00', description: 'CPF do proprietário' })
  @IsOptional()
  @IsString()
  @IsCPF({ message: 'CPF inválido.' })
  cpf?: string;
}
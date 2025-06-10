import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  Validate,
  IsPhoneNumber,
  Matches,
} from 'class-validator';
import { IsAdult } from '../../../common/validators/is-adult.validator';


export class RegisterRequestDto {
  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'Gabriel Fagundes',
  })
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário no formato DD-MM-YYYY. O usuário deve ser maior que dezoito anos.',
    example: '04-12-2010',
  })
  @IsNotEmpty({ message: 'A data de nascimento não pode estar vazia.' })
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
  message: 'A data de nascimento deve estar no formato DD-MM-YYYY.',
  })
  @Validate(IsAdult, { message: 'O usuário deve ser maior de 18 anos.' })
  birthDate: string;

  @ApiProperty({
    description: 'Endereço de e-mail único do usuário, que será usado para login.',
    example: 'gabriel.fagundes@email.com',
  })
  @IsEmail({}, { message: 'O e-mail fornecido não é válido.' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  email: string;

  @ApiProperty({
    example: 'StrongP@ssword123',
    description: 'Senha do usuário no sistema'
  })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Número de telefone do usuário, incluindo o código do país e DDD (formato E.164).',
    example: '+5535999998888',
  })
  @IsPhoneNumber('BR', { message: 'O número de telefone fornecido não é válido.' })
  @IsNotEmpty({ message: 'O telefone não pode estar vazio.' })
  phone: string;
}
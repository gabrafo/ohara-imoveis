import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsDateString,
  IsPhoneNumber, // Validador robusto para números de telefone
} from 'class-validator';

/**
 * Define a estrutura de dados esperada no corpo da requisição
 * para o endpoint de registro de um novo usuário.
 */
export class RegisterRequestDto {
  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'Gabriel Afonso',
  })
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário no formato YYYY-MM-DD.',
    example: '1990-01-25',
  })
  @IsDateString({}, { message: 'A data de nascimento deve estar no formato YYYY-MM-DD.' })
  @IsNotEmpty({ message: 'A data de nascimento não pode estar vazia.' })
  birthDate: Date;

  @ApiProperty({
    description: 'Endereço de e-mail único do usuário, que será usado para login.',
    example: 'gabriel.afonso@email.com',
  })
  @IsEmail({}, { message: 'O e-mail fornecido não é válido.' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário. Deve conter no mínimo 6 caracteres.',
    example: 'senhaForte123',
    minLength: 6,
  })
  @IsString({ message: 'A senha deve ser um texto.' })
  @MinLength(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  password: string;

  @ApiProperty({
    description: 'Número de telefone do usuário, incluindo o código do país e DDD (formato E.164).',
    example: '+5535999998888',
  })
  @IsPhoneNumber('BR', { message: 'O número de telefone fornecido não é válido.' })
  @IsNotEmpty({ message: 'O telefone não pode estar vazio.' })
  phone: string;
}
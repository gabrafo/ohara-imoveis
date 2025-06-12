import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, Matches, Validate } from "class-validator";
import { IsAdult } from "src/common/validators/is-adult.validator";

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'Gabriel Fagundes',
  })
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário no formato DD-MM-YYYY. O usuário deve ser maior que dezoito anos.',
    example: '04-04-2005',
  })
  @IsOptional()
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
  message: 'A data de nascimento deve estar no formato DD-MM-YYYY.',
  })
  @Validate(IsAdult, { message: 'O usuário deve ser maior de 18 anos.' })
  birthDate?: string;

  @ApiProperty({
    description: 'Endereço de e-mail único do usuário, que será usado para login.',
    example: 'gabriel.fagundes@email.com',
  })
  @IsEmail({}, { message: 'O e-mail fornecido não é válido.' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Número de telefone do usuário, incluindo o código do país e DDD (formato E.164).',
    example: '+5535999998888',
  })
  @IsPhoneNumber('BR', { message: 'O número de telefone fornecido não é válido.' })
  @IsOptional()
  phone?: string;
}
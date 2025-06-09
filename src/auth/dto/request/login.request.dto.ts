import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {

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
}
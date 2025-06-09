import { IsNotEmpty, IsString, IsStrongPassword, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {

    @ApiProperty({
        example: 'gabrafo',
        description: 'Nome de usuário no sistema'
    })
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    @Matches(/^[a-zA-Z0-9_.]+$/, {
      message: 'Username can only contain letters, numbers, underscores and periods',
    })
    username: string;

    @ApiProperty({
        example: 'StrongP@ssword123',
        description: 'Senha do usuário no sistema'
    })
    @IsString()
    @IsStrongPassword()
    password: string;
}
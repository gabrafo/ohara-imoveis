import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {

    @ApiProperty({
        description: 'Token de acesso JWT gerado após o login/registro. Ele serve para que o usuário possa acessar rotas protegidas da API.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RA...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'Token de atualização JWT gerado após o login/registro. Ele serve para obter um novo token de acesso sem precisar fazer login novamente.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RA...',
    })
    refreshToken: string;

    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
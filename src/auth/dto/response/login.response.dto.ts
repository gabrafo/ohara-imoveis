import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {

    @ApiProperty({
        description: 'Token de acesso JWT gerado após o login/registro.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RA...',
    })
    accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }
}
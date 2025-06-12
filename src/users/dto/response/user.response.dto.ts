import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/common/enums/role.enum";

export class UserResponseDto {
  @ApiProperty({ description: 'ID único do usuário', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Nome completo do usuário', example: 'João Silva' })
  name: string;

  @ApiProperty({ description: 'Email do usuário', example: 'joao@email.com' })
  email: string;

  @ApiProperty({ description: 'Telefone do usuário', example: '+5511999999999', required: false })
  phone?: string;

  @ApiProperty({ description: 'Role do usuário', enum: ['admin', 'customer', 'broker'], example: 'customer' })
  role: Role;
}
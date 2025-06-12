import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";
import { RegisterRequestDto } from "src/auth/dto/request/register.request.dto";
import { Role } from "src/common/enums/role.enum";

export class CreateUserDto extends RegisterRequestDto {
  @ApiPropertyOptional({ 
    description: 'Role do usuário',
    enum: ['admin', 'customer', 'broker'],
    example: 'broker'
  })
  @IsEnum(['admin', 'customer', 'broker'], { message: 'Role deve ser admin, customer ou broker' })
  role: Role;
}
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAddressDto {
  @ApiProperty({
    description: 'CEP do endereço (será usado para buscar outros dados via ViaCEP)',
    example: '12345-678',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  number: number;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Apto 101',
    required: false,
  })
  @IsString()
  @IsOptional()
  complement?: string;
}
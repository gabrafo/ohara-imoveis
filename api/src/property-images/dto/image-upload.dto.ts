import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ImageUploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Arquivo de imagem' })
  image: any;

  @ApiProperty({ 
    type: 'boolean', 
    required: false, 
    default: false,
    description: 'Define se esta imagem será a principal da propriedade' 
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiProperty({ 
    type: 'string', 
    required: false,
    description: 'Descrição opcional para a imagem' 
  })
  @IsOptional()
  @IsString()
  description?: string;
}
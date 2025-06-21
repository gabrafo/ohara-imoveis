import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { OfferType } from '../../../common/enums/offer-type.enum';
import { PropertyStatus } from '../../../common/enums/property-status.enum';

export class FilterPropertyRequestDto {
  @ApiProperty({
    description: 'Preço mínimo da propriedade',
    example: 100000.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({
    description: 'Preço máximo da propriedade',
    example: 500000.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiProperty({
    description: 'Área mínima da propriedade em metros quadrados',
    example: 60.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minArea?: number;

  @ApiProperty({
    description: 'Área máxima da propriedade em metros quadrados',
    example: 150.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxArea?: number;

  @ApiProperty({
    description: 'Status da propriedade',
    enum: PropertyStatus,
    example: PropertyStatus.AVAILABLE,
    required: false,
  })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiProperty({
    description: 'Tipo de oferta da propriedade',
    enum: OfferType,
    example: OfferType.FOR_SALE,
    required: false,
  })
  @IsEnum(OfferType)
  @IsOptional()
  offerType?: OfferType;

  @ApiProperty({
    description: 'ID do proprietário da propriedade',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  ownerId?: number;

  @ApiProperty({
    description: 'CEP para busca por proximidade',
    example: '01234-000',
    required: false,
  })
  @IsOptional()
  zipCode?: string;
} 
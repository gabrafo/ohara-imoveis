import { ApiProperty } from '@nestjs/swagger';
import { OfferType } from '../../../common/enums/offer-type.enum';
import { PropertyStatus } from '../../../common/enums/property-status.enum';

export class PropertyListResponseDto {
  @ApiProperty({
    description: 'ID único da propriedade',
    example: 1,
  })
  propertyId: number;

  @ApiProperty({
    description: 'Endereço resumido da propriedade',
    example: 'Rua das Flores, 123 - Centro',
  })
  addressSummary: string;

  @ApiProperty({
    description: 'Nome do proprietário',
    example: 'João Silva',
  })
  ownerName: string;

  @ApiProperty({
    description: 'Preço da propriedade',
    example: 250000.00,
  })
  price: number;

  @ApiProperty({
    description: 'Status atual da propriedade',
    enum: PropertyStatus,
    example: PropertyStatus.AVAILABLE,
  })
  status: PropertyStatus;

  @ApiProperty({
    description: 'Tipo de oferta da propriedade',
    enum: OfferType,
    example: OfferType.FOR_SALE,
  })
  offerType: OfferType;

  @ApiProperty({
    description: 'Área da propriedade em metros quadrados',
    example: 120.50,
  })
  area: number;

  @ApiProperty({
    description: 'URL da imagem principal da propriedade',
    example: '/uploads/properties/1/main.jpg',
    nullable: true,
  })
  mainImageUrl: string | null;

  @ApiProperty({
    description: 'Bairro da propriedade',
    example: 'Centro',
  })
  neighborhood: string;

  constructor(partial: Partial<PropertyListResponseDto>) {
    Object.assign(this, partial);
  }
} 
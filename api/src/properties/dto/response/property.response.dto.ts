import { ApiProperty } from '@nestjs/swagger';
import { OfferType } from '../../../common/enums/offer-type.enum';
import { PropertyStatus } from '../../../common/enums/property-status.enum';
import { Address } from '../../addresses/entities/address.entity';
import { Owner } from '../../../owners/entities/owner.entity';
import { PropertyImage } from '../../../property-images/entities/property-image.entity';
import { PropertyFeature } from '../../../property-features/entities/property-feature.entity';

export class PropertyResponseDto {
  @ApiProperty({
    description: 'ID único da propriedade',
    example: 1,
  })
  propertyId: number;

  @ApiProperty({
    description: 'Endereço completo da propriedade',
    type: () => Address,
  })
  address: Address;

  @ApiProperty({
    description: 'Informações sobre o proprietário',
    type: () => Owner,
  })
  owner: Owner;

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
    description: 'Data de registro da propriedade no sistema',
    example: '2023-07-15T00:00:00.000Z',
  })
  registrationDate: Date;

  @ApiProperty({
    description: 'Lista de imagens da propriedade',
    type: [PropertyImage],
    isArray: true,
  })
  images: PropertyImage[];

  @ApiProperty({
    description: 'Lista de características da propriedade',
    type: [PropertyFeature],
    isArray: true,
  })
  features: PropertyFeature[];

  constructor(partial: Partial<PropertyResponseDto>) {
    Object.assign(this, partial);
  }
} 
import { ApiProperty } from '@nestjs/swagger';
import { PropertyFeature } from '../../entities/property-feature.entity';
import { FeatureTypeResponseDto } from '../../../feature-types/dto/response/feature-type.response.dto';

export class PropertyFeatureResponseDto {
  @ApiProperty({
    description: 'ID único da característica da propriedade',
    example: 1,
  })
  propertyFeatureId: number;

  @ApiProperty({
    description: 'ID da propriedade',
    example: 1,
  })
  propertyId: number;

  @ApiProperty({
    description: 'Tipo de característica',
    type: FeatureTypeResponseDto,
  })
  featureType: FeatureTypeResponseDto;

  @ApiProperty({
    description: 'Quantidade da característica',
    example: 3,
    required: false,
  })
  quantity?: number;

  @ApiProperty({
    description: 'Detalhes adicionais sobre a característica',
    example: 'Quarto principal com suíte',
    required: false,
  })
  details?: string;

  constructor(propertyFeature: PropertyFeature) {
    this.propertyFeatureId = propertyFeature.propertyFeatureId;
    this.propertyId = propertyFeature.property?.propertyId;
    
    if (propertyFeature.featureType) {
      this.featureType = new FeatureTypeResponseDto(propertyFeature.featureType);
    }
    
    this.quantity = propertyFeature.quantity;
    this.details = propertyFeature.details;
  }
} 
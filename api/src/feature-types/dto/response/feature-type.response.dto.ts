import { ApiProperty } from '@nestjs/swagger';
import { FeatureType } from '../../entities/feature-type.entity';

export class FeatureTypeResponseDto {
  @ApiProperty({
    description: 'ID único da característica',
    example: 1,
  })
  featureId: number;

  @ApiProperty({
    description: 'Nome da característica',
    example: 'Quartos',
  })
  name: string;

  @ApiProperty({
    description: 'Unidade de medida da característica',
    example: 'm²',
    required: false,
  })
  unit?: string;

  @ApiProperty({
    description: 'Indica se a característica permite quantidade',
    example: true,
  })
  allowsQuantity: boolean;

  constructor(featureType: FeatureType) {
    this.featureId = featureType.featureId;
    this.name = featureType.name;
    this.unit = featureType.unit;
    this.allowsQuantity = featureType.allowsQuantity;
  }
} 
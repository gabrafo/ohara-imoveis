import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyFeaturesService } from './property-features.service';
import { PropertyFeaturesController } from './property-features.controller';
import { PropertyFeature } from './entities/property-feature.entity';
import { PropertiesModule } from '../properties/properties.module';
import { FeatureTypesModule } from '../feature-types/feature-types.module';
import { Property } from 'src/properties/entities/property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [PropertyFeature, Property]),
    PropertiesModule,
    FeatureTypesModule,
  ],
  controllers: [PropertyFeaturesController],
  providers: [PropertyFeaturesService],
  exports: [PropertyFeaturesService],
})
export class PropertyFeaturesModule {}

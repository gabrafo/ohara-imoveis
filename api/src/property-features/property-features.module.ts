import { Module } from '@nestjs/common';
import { PropertyFeaturesService } from './property-features.service';
import { PropertyFeaturesController } from './property-features.controller';

@Module({
  providers: [PropertyFeaturesService],
  controllers: [PropertyFeaturesController]
})
export class PropertyFeaturesModule {}

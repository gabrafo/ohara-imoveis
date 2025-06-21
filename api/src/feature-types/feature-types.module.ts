import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureTypesService } from './feature-types.service';
import { FeatureTypesController } from './feature-types.controller';
import { FeatureType } from './entities/feature-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureType])],
  controllers: [FeatureTypesController],
  providers: [FeatureTypesService],
  exports: [FeatureTypesService],
})
export class FeatureTypesModule {}

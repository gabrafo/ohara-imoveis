import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { HttpModule } from '@nestjs/axios';
import { OwnersModule } from 'src/owners/owners.module';

@Module({
  providers: [PropertiesService],
  controllers: [PropertiesController],
  imports: [TypeOrmModule.forFeature([Property]), HttpModule, OwnersModule],
  exports: [PropertiesService],
})
export class PropertiesModule {}
 
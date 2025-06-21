import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureType } from './entities/feature-type.entity';
import { CreateFeatureTypeDto } from './dto/request/create-feature-type.dto';
import { UpdateFeatureTypeDto } from './dto/request/update-feature-type.dto';

@Injectable()
export class FeatureTypesService {
  constructor(
    @InjectRepository(FeatureType)
    private featureTypeRepository: Repository<FeatureType>,
  ) {}

  async create(createFeatureTypeDto: CreateFeatureTypeDto): Promise<FeatureType> {
    const featureType = this.featureTypeRepository.create(createFeatureTypeDto);
    return this.featureTypeRepository.save(featureType);
  }

  async findAll(): Promise<FeatureType[]> {
    return this.featureTypeRepository.find();
  }

  async findOne(id: number): Promise<FeatureType> {
    const featureType = await this.featureTypeRepository.findOne({ 
      where: { featureId: id } 
    });
    
    if (!featureType) {
      throw new NotFoundException(`Tipo de característica com ID ${id} não encontrado`);
    }
    
    return featureType;
  }

  async update(id: number, updateFeatureTypeDto: UpdateFeatureTypeDto): Promise<FeatureType> {
    const featureType = await this.findOne(id);
    
    Object.assign(featureType, updateFeatureTypeDto);
    
    return this.featureTypeRepository.save(featureType);
  }

  async remove(id: number): Promise<void> {
    const result = await this.featureTypeRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Tipo de característica com ID ${id} não encontrado`);
    }
  }
}

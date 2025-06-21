import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyFeature } from './entities/property-feature.entity';
import { CreatePropertyFeatureDto } from './dto/request/create-property-feature.dto';
import { UpdatePropertyFeatureDto } from './dto/request/update-property-feature.dto';
import { FeatureTypesService } from '../feature-types/feature-types.service';
import { Property } from '../properties/entities/property.entity';

@Injectable()
export class PropertyFeaturesService {
  constructor(
    @InjectRepository(PropertyFeature)
    private propertyFeatureRepository: Repository<PropertyFeature>,
    private readonly featureTypesService: FeatureTypesService,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async create(createPropertyFeatureDto: CreatePropertyFeatureDto): Promise<PropertyFeature> {
    const { propertyId, featureTypeId } = createPropertyFeatureDto;
    
    const property = await this.propertyRepository.findOne({ where: { propertyId } });
    if (!property) {
      throw new NotFoundException(`Propriedade com ID ${propertyId} não encontrada`);
    }
    
    const featureType = await this.featureTypesService.findOne(featureTypeId);
    
    if (!featureType) {
      throw new NotFoundException(`Tipo de característica com ID ${featureTypeId} não encontrado`);
    }
    
    if (createPropertyFeatureDto.quantity && !featureType.allowsQuantity) {
      throw new BadRequestException(`O tipo de característica "${featureType.name}" não permite quantidade`);
    }
    
    const propertyFeature = new PropertyFeature();
    propertyFeature.property = property;
    propertyFeature.featureType = featureType;
    propertyFeature.quantity = createPropertyFeatureDto.quantity;
    propertyFeature.details = createPropertyFeatureDto.details;
    
    return this.propertyFeatureRepository.save(propertyFeature);
  }

  async findAllByPropertyId(propertyId: number): Promise<PropertyFeature[]> {
    const property = await this.propertyRepository.findOne({ where: { propertyId } });
    if (!property) {
      throw new NotFoundException(`Propriedade com ID ${propertyId} não encontrada`);
    }
    
    return this.propertyFeatureRepository.createQueryBuilder('propertyFeature')
      .innerJoinAndSelect('propertyFeature.featureType', 'featureType')
      .where('propertyFeature.propertyId = :propertyId', { propertyId })
      .getMany();
  }

  async findOne(id: number): Promise<PropertyFeature> {
    const propertyFeature = await this.propertyFeatureRepository.findOne({
      where: { propertyFeatureId: id },
      relations: ['property', 'featureType'],
    });
    
    if (!propertyFeature) {
      throw new NotFoundException(`Característica de propriedade com ID ${id} não encontrada`);
    }
    
    return propertyFeature;
  }

  async update(id: number, updatePropertyFeatureDto: UpdatePropertyFeatureDto): Promise<PropertyFeature> {
    const propertyFeature = await this.findOne(id);
    const { featureTypeId, quantity } = updatePropertyFeatureDto;
    
    // Se estiver atualizando o tipo de característica
    if (featureTypeId && featureTypeId !== propertyFeature.featureType.featureId) {
      const featureType = await this.featureTypesService.findOne(featureTypeId);
      
      if (!featureType) {
        throw new NotFoundException(`Tipo de característica com ID ${featureTypeId} não encontrado`);
      }
      
      propertyFeature.featureType = featureType;
      
      // Verifica se o novo tipo de característica permite quantidade
      if (quantity && !featureType.allowsQuantity) {
        throw new BadRequestException(`O tipo de característica "${featureType.name}" não permite quantidade`);
      }
    }
    
    // Se estiver atualizando a quantidade
    if (quantity !== undefined) {
      // Verifica se o tipo de característica atual permite quantidade
      if (!propertyFeature.featureType.allowsQuantity) {
        throw new BadRequestException(
          `O tipo de característica "${propertyFeature.featureType.name}" não permite quantidade`,
        );
      }
      propertyFeature.quantity = quantity;
    }
    
    // Atualiza os detalhes, se fornecidos
    if (updatePropertyFeatureDto.details !== undefined) {
      propertyFeature.details = updatePropertyFeatureDto.details;
    }
    
    return this.propertyFeatureRepository.save(propertyFeature);
  }

  async remove(id: number): Promise<void> {
    const result = await this.propertyFeatureRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Característica de propriedade com ID ${id} não encontrada`);
    }
  }
}

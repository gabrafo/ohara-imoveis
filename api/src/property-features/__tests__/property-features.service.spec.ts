import { Test, TestingModule } from '@nestjs/testing';
import { PropertyFeaturesService } from '../property-features.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PropertyFeature } from '../entities/property-feature.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PropertiesService } from '../../properties/properties.service';
import { FeatureTypesService } from '../../feature-types/feature-types.service';
import { CreatePropertyFeatureDto } from '../dto/request/create-property-feature.dto';
import { UpdatePropertyFeatureDto } from '../dto/request/update-property-feature.dto';
import { Property } from '../../properties/entities/property.entity';

type MockRepository<T = any> = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
  merge?: jest.Mock;
  createQueryBuilder: jest.Mock;
};

const createMockRepository = (): MockRepository => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  merge: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
});

describe('PropertyFeaturesService', () => {
  let service: PropertyFeaturesService;
  let propertyFeatureRepository: MockRepository;
  let propertyRepository: MockRepository;
  let featureTypesService: { findOne: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyFeaturesService,
        {
          provide: getRepositoryToken(PropertyFeature),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Property),
          useValue: createMockRepository(),
        },
        { 
          provide: PropertiesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        { 
          provide: FeatureTypesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PropertyFeaturesService>(PropertyFeaturesService);
    propertyFeatureRepository = module.get<MockRepository>(getRepositoryToken(PropertyFeature));
    propertyRepository = module.get<MockRepository>(getRepositoryToken(Property));
    featureTypesService = module.get(FeatureTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a property feature successfully', async () => {
      const createDto: CreatePropertyFeatureDto = {
        propertyId: 1,
        featureTypeId: 1,
        quantity: 3,
        details: 'Detalhes do quarto',
      };
      
      const property = { propertyId: 1, name: 'Apartamento' };
      const featureType = { featureId: 1, name: 'Quartos', allowsQuantity: true };
      const propertyFeature = new PropertyFeature();
      const savedPropertyFeature = {
        propertyFeatureId: 1,
        ...createDto,
        property,
        featureType,
      };
      
      propertyRepository.findOne.mockResolvedValue(property);
      featureTypesService.findOne.mockResolvedValue(featureType);
      propertyFeatureRepository.save.mockResolvedValue(savedPropertyFeature);
      
      const result = await service.create(createDto);
      
      expect(propertyRepository.findOne).toHaveBeenCalledWith({ where: { propertyId: createDto.propertyId } });
      expect(featureTypesService.findOne).toHaveBeenCalledWith(createDto.featureTypeId);
      expect(result).toEqual(savedPropertyFeature);
    });

    it('should throw NotFoundException when property is not found', async () => {
      const createDto: CreatePropertyFeatureDto = {
        propertyId: 999,
        featureTypeId: 1,
        quantity: 3,
        details: 'Detalhes',
      };
      
      propertyRepository.findOne.mockResolvedValue(null);
      
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(propertyRepository.findOne).toHaveBeenCalledWith({ where: { propertyId: createDto.propertyId } });
      expect(featureTypesService.findOne).not.toHaveBeenCalled();
      expect(propertyFeatureRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when feature type is not found', async () => {
      const createDto: CreatePropertyFeatureDto = {
        propertyId: 1,
        featureTypeId: 999,
        quantity: 3,
        details: 'Detalhes',
      };
      
      const property = { propertyId: 1, name: 'Apartamento' };
      
      propertyRepository.findOne.mockResolvedValue(property);
      featureTypesService.findOne.mockResolvedValue(null);
      
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(propertyRepository.findOne).toHaveBeenCalledWith({ where: { propertyId: createDto.propertyId } });
      expect(featureTypesService.findOne).toHaveBeenCalledWith(createDto.featureTypeId);
      expect(propertyFeatureRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when feature type does not allow quantity', async () => {
      const createDto: CreatePropertyFeatureDto = {
        propertyId: 1,
        featureTypeId: 1,
        quantity: 3,
        details: 'Detalhes',
      };
      
      const property = { propertyId: 1, name: 'Apartamento' };
      const featureType = { featureId: 1, name: 'Área', allowsQuantity: false };
      
      propertyRepository.findOne.mockResolvedValue(property);
      featureTypesService.findOne.mockResolvedValue(featureType);
      
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(propertyRepository.findOne).toHaveBeenCalledWith({ where: { propertyId: createDto.propertyId } });
      expect(featureTypesService.findOne).toHaveBeenCalledWith(createDto.featureTypeId);
      expect(propertyFeatureRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAllByPropertyId', () => {
    it('should return all property features for a property', async () => {
      const propertyId = 1;
      const property = { propertyId: 1, name: 'Apartamento' };
      const propertyFeatures = [
        { propertyFeatureId: 1, property, featureType: { featureId: 1, name: 'Quartos' } },
        { propertyFeatureId: 2, property, featureType: { featureId: 2, name: 'Banheiros' } },
      ];
      
      propertyRepository.findOne.mockResolvedValue(property);
      const queryBuilderMock = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(propertyFeatures),
      };
      propertyFeatureRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);
      
      const result = await service.findAllByPropertyId(propertyId);
      
      expect(propertyRepository.findOne).toHaveBeenCalledWith({ where: { propertyId } });
      expect(propertyFeatureRepository.createQueryBuilder).toHaveBeenCalledWith('propertyFeature');
      expect(queryBuilderMock.innerJoinAndSelect).toHaveBeenCalledWith('propertyFeature.featureType', 'featureType');
      expect(queryBuilderMock.where).toHaveBeenCalledWith('propertyFeature.propertyId = :propertyId', { propertyId });
      expect(result).toEqual(propertyFeatures);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      const propertyId = 999;
      
      propertyRepository.findOne.mockResolvedValue(null);
      
      await expect(service.findAllByPropertyId(propertyId)).rejects.toThrow(NotFoundException);
      expect(propertyRepository.findOne).toHaveBeenCalledWith({ where: { propertyId } });
      expect(propertyFeatureRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a property feature when it exists', async () => {
      const id = 1;
      const propertyFeature = {
        propertyFeatureId: 1,
        property: { propertyId: 1 },
        featureType: { featureId: 1, name: 'Quartos' },
      };
      
      propertyFeatureRepository.findOne.mockResolvedValue(propertyFeature);
      
      const result = await service.findOne(id);
      
      expect(propertyFeatureRepository.findOne).toHaveBeenCalledWith({
        where: { propertyFeatureId: id },
        relations: ['property', 'featureType'],
      });
      expect(result).toEqual(propertyFeature);
    });

    it('should throw NotFoundException when property feature does not exist', async () => {
      const id = 999;
      
      propertyFeatureRepository.findOne.mockResolvedValue(null);
      
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(propertyFeatureRepository.findOne).toHaveBeenCalledWith({
        where: { propertyFeatureId: id },
        relations: ['property', 'featureType'],
      });
    });
  });

  describe('update', () => {
    it('should update a property feature successfully', async () => {
      const id = 1;
      const updateDto: UpdatePropertyFeatureDto = {
        details: 'Detalhes atualizados',
      };
      
      const existingFeature = {
        propertyFeatureId: 1,
        property: { propertyId: 1 },
        featureType: { featureId: 1, name: 'Quartos', allowsQuantity: true },
        quantity: 2,
        details: 'Detalhes antigos',
      };
      
      const updatedFeature = {
        ...existingFeature,
        details: updateDto.details,
      };
      
      propertyFeatureRepository.findOne.mockResolvedValue(existingFeature);
      propertyFeatureRepository.save.mockResolvedValue(updatedFeature);
      
      const result = await service.update(id, updateDto);
      
      expect(propertyFeatureRepository.findOne).toHaveBeenCalledWith({
        where: { propertyFeatureId: id },
        relations: ['property', 'featureType'],
      });
      expect(propertyFeatureRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        propertyFeatureId: existingFeature.propertyFeatureId,
        details: updateDto.details,
      }));
      expect(result).toEqual(updatedFeature);
    });

    it('should throw BadRequestException when updating quantity for feature type that does not allow it', async () => {
      const id = 1;
      const updateDto: UpdatePropertyFeatureDto = {
        quantity: 3,
      };
      
      const existingFeature = {
        propertyFeatureId: 1,
        property: { propertyId: 1 },
        featureType: { featureId: 1, name: 'Área', allowsQuantity: false },
        details: 'Detalhes',
      };
      
      propertyFeatureRepository.findOne.mockResolvedValue(existingFeature);
      
      await expect(service.update(id, updateDto)).rejects.toThrow(BadRequestException);
      expect(propertyFeatureRepository.findOne).toHaveBeenCalledWith({
        where: { propertyFeatureId: id },
        relations: ['property', 'featureType'],
      });
      expect(propertyFeatureRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a property feature when it exists', async () => {
      const id = 1;
      
      propertyFeatureRepository.delete.mockResolvedValue({ affected: 1 });
      
      await service.remove(id);
      
      expect(propertyFeatureRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when property feature does not exist', async () => {
      const id = 999;
      
      propertyFeatureRepository.delete.mockResolvedValue({ affected: 0 });
      
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(propertyFeatureRepository.delete).toHaveBeenCalledWith(id);
    });
  });
}); 
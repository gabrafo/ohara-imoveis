import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureTypesService } from '../feature-types.service';
import { FeatureType } from '../entities/feature-type.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateFeatureTypeDto } from '../dto/request/create-feature-type.dto';
import { UpdateFeatureTypeDto } from '../dto/request/update-feature-type.dto';

// Mock para o repositório
type MockRepository = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;  
  save: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

const createMockRepository = (): MockRepository => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('FeatureTypesService', () => {
  let service: FeatureTypesService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureTypesService,
        {
          provide: getRepositoryToken(FeatureType),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<FeatureTypesService>(FeatureTypesService);
    repository = module.get<MockRepository>(getRepositoryToken(FeatureType));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new feature type', async () => {
      const createFeatureTypeDto: CreateFeatureTypeDto = {
        name: 'Test Feature Type',
        allowsQuantity: true,
      };
      
      const featureType = {
        id: 1,
        ...createFeatureTypeDto,
      };
      
      repository.create.mockReturnValue(featureType);
      repository.save.mockResolvedValue(featureType);
      
      const result = await service.create(createFeatureTypeDto);
      
      expect(repository.create).toHaveBeenCalledWith(createFeatureTypeDto);
      expect(repository.save).toHaveBeenCalledWith(featureType);
      expect(result).toEqual(featureType);
    });
  });

  describe('findAll', () => {
    it('should return an array of feature types', async () => {
      const featureTypes = [
        { id: 1, name: 'Feature Type 1', allowsQuantity: true },
        { id: 2, name: 'Feature Type 2', allowsQuantity: false },
      ];
      repository.find.mockResolvedValue(featureTypes);
      
      const result = await service.findAll();
      
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(featureTypes);
    });
  });

  describe('findOne', () => {
    it('should return a feature type when it exists', async () => {
      const featureId = 1;
      const featureType = { featureId, name: 'Feature Type 1', allowsQuantity: true };
      repository.findOne.mockResolvedValue(featureType);
      
      const result = await service.findOne(featureId);
      
      expect(repository.findOne).toHaveBeenCalledWith({ where: { featureId } });
      expect(result).toEqual(featureType);
    });
    
    it('should throw NotFoundException when feature type does not exist', async () => {
      const featureId = 999;
      const expectedErrorMessage = `Tipo de característica com ID ${featureId} não encontrado`;
      repository.findOne.mockResolvedValue(null);
      
      try {
        await service.findOne(featureId);
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(expectedErrorMessage);
      }
    });
  });

  describe('update', () => {
    it('should update a feature type when it exists', async () => {
      const featureId = 1;
      const updateFeatureTypeDto: UpdateFeatureTypeDto = {
        name: 'Updated Feature Type',
      };
      
      const existingFeatureType = {
        featureId,
        name: 'Feature Type 1',
        allowsQuantity: true,
        unit: 'm²',
      };
      
      const updatedFeatureType = {
        ...existingFeatureType,
        ...updateFeatureTypeDto,
      };
      
      const findOneSpy = jest.spyOn(service, 'findOne');
      findOneSpy.mockResolvedValue(existingFeatureType);
      const saveSpy = jest.spyOn(repository, 'save');
      saveSpy.mockResolvedValue(updatedFeatureType);
      
      const result = await service.update(featureId, updateFeatureTypeDto);
      
      expect(findOneSpy).toHaveBeenCalledWith(featureId);
      expect(saveSpy).toHaveBeenCalledWith(updatedFeatureType);
      expect(result).toEqual(updatedFeatureType);
    });
    
    it('should throw NotFoundException when feature type does not exist', async () => {
      const featureId = 999;
      const updateFeatureTypeDto: UpdateFeatureTypeDto = { name: 'Updated Feature Type' };
      const expectedErrorMessage = `Tipo de característica com ID ${featureId} não encontrado`;
      repository.findOne.mockResolvedValue(null);
      
      try {
        await service.update(featureId, updateFeatureTypeDto);
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(expectedErrorMessage);
      }
    });
  });

  describe('remove', () => {
    it('should remove a feature type when it exists', async () => {
      const featureId = 1;
      const deleteSpy = jest.spyOn(repository, 'delete');
      deleteSpy.mockResolvedValue({ affected: 1 });
      
      await service.remove(featureId);
      
      expect(deleteSpy).toHaveBeenCalledWith(featureId);
    });
    
    it('should throw NotFoundException when feature type does not exist', async () => {
      const featureId = 999;
      const expectedErrorMessage = `Tipo de característica com ID ${featureId} não encontrado`;
      const deleteSpy = jest.spyOn(repository, 'delete');
      deleteSpy.mockResolvedValue({ affected: 0 });
      
      try {
        await service.remove(featureId);
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(expectedErrorMessage);
      }
    });
  });
}); 
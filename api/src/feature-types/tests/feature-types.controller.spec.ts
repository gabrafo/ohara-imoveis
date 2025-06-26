import { Test, TestingModule } from '@nestjs/testing';
import { FeatureTypesController } from '../feature-types.controller';
import { FeatureTypesService } from '../feature-types.service';
import { CreateFeatureTypeDto } from '../dto/request/create-feature-type.dto';
import { UpdateFeatureTypeDto } from '../dto/request/update-feature-type.dto';
import { FeatureType } from '../entities/feature-type.entity';
import { NotFoundException } from '@nestjs/common';

describe('FeatureTypesController', () => {
  let controller: FeatureTypesController;
  let service: FeatureTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeatureTypesController],
      providers: [
        {
          provide: FeatureTypesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FeatureTypesController>(FeatureTypesController);
    service = module.get<FeatureTypesService>(FeatureTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new feature type', async () => {
      const createDto: CreateFeatureTypeDto = {
        name: 'Quartos',
        unit: 'un',
        allowsQuantity: true,
      };
      
      const featureType: FeatureType = {
        featureId: 1,
        name: 'Quartos',
        unit: 'un',
        allowsQuantity: true,
      };
      
      jest.spyOn(service, 'create').mockResolvedValue(featureType);
      
      const result = await controller.create(createDto);
      
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expect.objectContaining({
        featureId: featureType.featureId,
        name: featureType.name,
        unit: featureType.unit,
        allowsQuantity: featureType.allowsQuantity,
      }));
    });
  });

  describe('findAll', () => {
    it('should return an array of feature types', async () => {
      const featureTypes: FeatureType[] = [
        { featureId: 1, name: 'Quartos', unit: 'un', allowsQuantity: true },
        { featureId: 2, name: 'Área', unit: 'm²', allowsQuantity: false },
      ];
      
      jest.spyOn(service, 'findAll').mockResolvedValue(featureTypes);
      
      const result = await controller.findAll();
      
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        featureId: featureTypes[0].featureId,
        name: featureTypes[0].name,
      }));
    });
  });

  describe('findOne', () => {
    it('should return a feature type when it exists', async () => {
      const featureType: FeatureType = {
        featureId: 1,
        name: 'Quartos',
        unit: 'un',
        allowsQuantity: true,
      };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(featureType);
      
      const result = await controller.findOne(1);
      
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expect.objectContaining({
        featureId: featureType.featureId,
        name: featureType.name,
      }));
    });

    it('should throw NotFoundException when feature type does not exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update a feature type when it exists', async () => {
      const updateDto: UpdateFeatureTypeDto = { name: 'Quartos Atualizados' };
      const updatedFeatureType: FeatureType = {
        featureId: 1,
        name: 'Quartos Atualizados',
        unit: 'un',
        allowsQuantity: true,
      };
      
      jest.spyOn(service, 'update').mockResolvedValue(updatedFeatureType);
      
      const result = await controller.update(1, updateDto);
      
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expect.objectContaining({
        featureId: updatedFeatureType.featureId,
        name: updatedFeatureType.name,
      }));
    });
  });

  describe('remove', () => {
    it('should remove a feature type when it exists', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);
      
      await controller.remove(1);
      
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
}); 
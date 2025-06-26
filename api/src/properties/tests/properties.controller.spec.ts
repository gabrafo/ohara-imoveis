import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from '../properties.controller';
import { PropertiesService } from '../properties.service';
import { CreatePropertyRequestDto } from '../dto/request/create-property.request.dto';
import { UpdatePropertyRequestDto } from '../dto/request/update-property.request.dto';
import { FilterPropertyRequestDto } from '../dto/request/filter-property.request.dto';
import { PropertyResponseDto } from '../dto/response/property.response.dto';
import { PropertyListResponseDto } from '../dto/response/property-list.response.dto';
import { OfferType } from '../../common/enums/offer-type.enum';
import { PropertyStatus } from '../../common/enums/property-status.enum';
import { NotFoundException } from '@nestjs/common';
import { PaginateQuery } from 'nestjs-paginate';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: {
    createProperty: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    // Criar mock do service
    service = {
      createProperty: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new property', async () => {
      // Dados de teste
      const createDto: CreatePropertyRequestDto = {
        address: {
          zipCode: '12345-678',
          number: 123,
          complement: 'Apto 101',
        },
        ownerId: 1,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        offerType: OfferType.FOR_SALE,
        area: 120.5,
      };

      const property = {
        propertyId: 1,
        ...createDto,
        registrationDate: new Date(),
        owner: { ownerId: 1, name: 'Owner Test' },
        features: [],
        images: [],
        visits: [],
      };

      // Configuração do mock
      service.createProperty.mockResolvedValue(property);

      // Execução
      const result = await controller.create(createDto);

      // Verificações
      expect(service.createProperty).toHaveBeenCalledWith(createDto);
      expect(result).toBeInstanceOf(PropertyResponseDto);
      expect(result.propertyId).toBe(property.propertyId);
    });
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      // Dados de teste
      const query: PaginateQuery = { page: 1, limit: 10, path: 'properties' };
      const filters: FilterPropertyRequestDto = {
        minPrice: 200000,
        maxPrice: 400000,
      };

      const properties = [
        {
          propertyId: 1,
          price: 250000,
          status: PropertyStatus.AVAILABLE,
          area: 120,
          offerType: OfferType.FOR_SALE,
          owner: { ownerId: 1, name: 'Owner Test' },
        },
        {
          propertyId: 2,
          price: 350000,
          status: PropertyStatus.AVAILABLE,
          area: 150,
          offerType: OfferType.FOR_SALE,
          owner: { ownerId: 2, name: 'Owner Test 2' },
        },
      ];

      const paginatedResult = {
        data: properties,
        meta: {
          itemsPerPage: 10,
          totalItems: 2,
          currentPage: 1,
          totalPages: 1,
          sortBy: [['propertyId', 'DESC']] as any,
          searchBy: [] as string[],
          search: '',
          select: ['propertyId', 'price', 'area', 'status', 'offerType'] as string[],
          filter: {},
        },
        links: {
          first: '/properties?page=1&limit=10',
          previous: '',
          current: '/properties?page=1&limit=10',
          next: '',
          last: '/properties?page=1&limit=10',
        },
      };

      // Configuração do mock
      service.findAll.mockResolvedValue(paginatedResult);

      // Execução
      const result = await controller.findAll(query, filters);

      // Verificações
      expect(service.findAll).toHaveBeenCalledWith(query, filters);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(PropertyListResponseDto);
      expect(result.data[0].propertyId).toBe(properties[0].propertyId);
      expect(result.data[1].propertyId).toBe(properties[1].propertyId);
    });

    it('should return an empty array if no properties are found', async () => {
      // Dados de teste
      const query: PaginateQuery = { page: 1, limit: 10, path: 'properties' };
      const emptyPaginatedResult = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
          sortBy: [['propertyId', 'DESC']] as any,
          searchBy: [] as string[],
          search: '',
          select: ['propertyId', 'price', 'area', 'status', 'offerType'] as string[],
          filter: {},
        },
        links: {
          first: '/properties?page=1&limit=10',
          previous: '',
          current: '/properties?page=1&limit=10',
          next: '',
          last: '/properties?page=1&limit=10',
        },
      };

      // Configuração do mock
      service.findAll.mockResolvedValue(emptyPaginatedResult);

      // Execução
      const result = await controller.findAll(query, {});

      // Verificações
      expect(service.findAll).toHaveBeenCalledWith(query, {});
      expect(result.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a property when it exists', async () => {
      // Dados de teste
      const propertyId = 1;
      const property = {
        propertyId,
        price: 250000,
        area: 120,
        status: PropertyStatus.AVAILABLE,
        offerType: OfferType.FOR_SALE,
        owner: { ownerId: 1, name: 'Owner Test' },
        features: [],
        images: [],
        address: {
          zipCode: '12345-678',
          street: 'Rua Teste',
          number: 123,
          complement: 'Apto 101',
          neighborhood: 'Bairro Teste',
          city: 'São Paulo',
          state: 'SP',
        },
      };

      // Configuração do mock
      service.findOne.mockResolvedValue(property);

      // Execução
      const result = await controller.findOne(propertyId);

      // Verificações
      expect(service.findOne).toHaveBeenCalledWith(propertyId);
      expect(result).toBeInstanceOf(PropertyResponseDto);
      expect(result.propertyId).toBe(propertyId);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      // Dados de teste
      const propertyId = 999;

      // Configuração do mock
      service.findOne.mockRejectedValue(new NotFoundException(`Propriedade com ID ${propertyId} não encontrada`));

      // Execução e verificação
      await expect(controller.findOne(propertyId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(propertyId);
    });
  });

  describe('update', () => {
    it('should update and return a property when it exists', async () => {
      // Dados de teste
      const propertyId = 1;
      const updateDto: UpdatePropertyRequestDto = {
        price: 300000,
        status: PropertyStatus.CONCLUDED,
      };

      const updatedProperty = {
        propertyId,
        price: 300000,
        status: PropertyStatus.CONCLUDED,
        area: 120,
        offerType: OfferType.FOR_SALE,
        owner: { ownerId: 1, name: 'Owner Test' },
      };

      // Configuração do mock
      service.update.mockResolvedValue(updatedProperty);

      // Execução
      const result = await controller.update(propertyId, updateDto);

      // Verificações
      expect(service.update).toHaveBeenCalledWith(propertyId, updateDto);
      expect(result).toBeInstanceOf(PropertyResponseDto);
      expect(result.propertyId).toBe(propertyId);
      expect(result.price).toBe(updateDto.price);
      expect(result.status).toBe(updateDto.status);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      // Dados de teste
      const propertyId = 999;
      const updateDto: UpdatePropertyRequestDto = { price: 300000 };

      // Configuração do mock
      service.update.mockRejectedValue(new NotFoundException(`Propriedade com ID ${propertyId} não encontrada`));

      // Execução e verificação
      await expect(controller.update(propertyId, updateDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(propertyId, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a property successfully', async () => {
      // Dados de teste
      const propertyId = 1;

      // Configuração do mock
      service.remove.mockResolvedValue(undefined);

      // Execução
      await controller.remove(propertyId);

      // Verificações
      expect(service.remove).toHaveBeenCalledWith(propertyId);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      // Dados de teste
      const propertyId = 999;

      // Configuração do mock
      service.remove.mockRejectedValue(new NotFoundException(`Propriedade com ID ${propertyId} não encontrada`));

      // Execução e verificação
      await expect(controller.remove(propertyId)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(propertyId);
    });
  });
}); 
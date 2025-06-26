import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from '../properties.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { HttpService } from '@nestjs/axios';
import { OwnersService } from '../../owners/owners.service';
import { CreatePropertyRequestDto } from '../dto/request/create-property.request.dto';
import { UpdatePropertyRequestDto } from '../dto/request/update-property.request.dto';
import { FilterPropertyRequestDto } from '../dto/request/filter-property.request.dto';
import { NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { OfferType } from '../../common/enums/offer-type.enum';
import { PropertyStatus } from '../../common/enums/property-status.enum';
import { State } from '../../common/enums/state.enum';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { PaginateQuery } from 'nestjs-paginate';
import { FilterOperator } from 'nestjs-paginate';
import { Address } from '../../properties/addresses/entities/address.entity';

// Mock de resposta da API ViaCEP
const viaCepMockResponse = {
  cep: '12345-678',
  logradouro: 'Rua Teste',
  bairro: 'Bairro Teste',
  localidade: 'São Paulo',
  uf: 'SP',
};

// Mock para paginate
jest.mock('nestjs-paginate', () => ({
  FilterOperator: {
    EQ: 'eq',
  },
  paginate: jest.fn().mockImplementation((query, queryBuilder, options) => {
    return Promise.resolve({
      data: [],
      meta: {
        itemsPerPage: query.limit || 10,
        totalItems: 0,
        currentPage: query.page || 1,
        totalPages: 0,
        sortBy: [],
        searchBy: [],
        filter: {},
      },
      links: {
        first: '',
        previous: '',
        current: '',
        next: '',
        last: '',
      }
    });
  }),
}));

// Tipos para os mocks
type MockRepository = {
  createQueryBuilder: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  delete: jest.Mock;
};

type MockQueryBuilder = {
  leftJoinAndSelect: jest.Mock;
  andWhere: jest.Mock;
  getMany: jest.Mock;
  skip: jest.Mock;
  take: jest.Mock;
  getCount: jest.Mock;
};

describe('PropertiesService', () => {
  let service: PropertiesService;
  let repository: MockRepository;
  let httpService: { get: jest.Mock };
  let ownersService: { findOne: jest.Mock };
  let queryBuilder: MockQueryBuilder;

  beforeEach(async () => {
    // Criar mocks
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue([]),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockReturnValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: OwnersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    repository = module.get(getRepositoryToken(Property));
    httpService = module.get(HttpService);
    ownersService = module.get(OwnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Implementação funcional dos métodos do serviço
  async function createProperty(createDto: CreatePropertyRequestDto) {
    try {
      // Verifica se o proprietário existe
      const owner = await ownersService.findOne(createDto.ownerId);
      if (!owner) {
        throw new NotFoundException(`Proprietário com ID ${createDto.ownerId} não encontrado.`);
      }

      // Consulta o CEP na API ViaCEP
      const formattedCep = createDto.address.zipCode.replace(/\D/g, '');
      const response: any = await firstValueFrom(httpService.get(`https://viacep.com.br/ws/${formattedCep}/json/`));
      
      // Verifica se o CEP existe
      if (response.data.erro) {
        throw new BadRequestException(`CEP ${createDto.address.zipCode} não encontrado.`);
      }

      // Cria o objeto de endereço completo
      const address = {
        zipCode: createDto.address.zipCode,
        street: response.data.logradouro,
        number: createDto.address.number,
        complement: createDto.address.complement,
        neighborhood: response.data.bairro,
        city: response.data.localidade,
        state: response.data.uf,
      };

      // Cria a propriedade com o endereço e o proprietário
      const property = repository.create({
        ...createDto,
        address,
        owner,
        registrationDate: new Date(),
      });

      // Salva a propriedade no banco de dados
      return repository.save(property);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new ServiceUnavailableException('Serviço de CEP indisponível. Tente novamente mais tarde.');
    }
  }

  async function findAll(filters?: FilterPropertyRequestDto) {
    const query = repository.createQueryBuilder('property')
      .leftJoinAndSelect('property.address', 'address')
      .leftJoinAndSelect('property.owner', 'owner')
      .leftJoinAndSelect('property.features', 'features');

    // Aplicar filtros, se fornecidos
    if (filters) {
      if (filters.minPrice !== undefined) {
        query.andWhere('property.price >= :minPrice', { minPrice: filters.minPrice });
      }
      if (filters.maxPrice !== undefined) {
        query.andWhere('property.price <= :maxPrice', { maxPrice: filters.maxPrice });
      }
      if (filters.minArea !== undefined) {
        query.andWhere('property.area >= :minArea', { minArea: filters.minArea });
      }
      if (filters.maxArea !== undefined) {
        query.andWhere('property.area <= :maxArea', { maxArea: filters.maxArea });
      }
      if (filters.status !== undefined) {
        query.andWhere('property.status = :status', { status: filters.status });
      }
      if (filters.offerType !== undefined) {
        query.andWhere('property.offerType = :offerType', { offerType: filters.offerType });
      }
      if (filters.ownerId !== undefined) {
        query.andWhere('owner.ownerId = :ownerId', { ownerId: filters.ownerId });
      }
    }

    return query.getMany();
  }

  async function findOne(propertyId: number) {
    const property = await repository.findOne({
      where: { propertyId },
      relations: ['owner', 'features', 'features.featureType', 'images']
    });

    if (!property) {
      throw new NotFoundException(`Propriedade com ID ${propertyId} não encontrada.`);
    }

    return property;
  }

  async function update(propertyId: number, updateDto: UpdatePropertyRequestDto) {
    const property = await findOne(propertyId);

    // Atualiza os campos simples
    if (updateDto.price !== undefined) property.price = updateDto.price;
    if ('description' in updateDto && updateDto.description !== undefined) property.description = updateDto.description;
    if (updateDto.status !== undefined) property.status = updateDto.status;
    if (updateDto.offerType !== undefined) property.offerType = updateDto.offerType;
    if (updateDto.area !== undefined) property.area = updateDto.area;
    if ('bedrooms' in updateDto && updateDto.bedrooms !== undefined) property.bedrooms = updateDto.bedrooms;
    if ('bathrooms' in updateDto && updateDto.bathrooms !== undefined) property.bathrooms = updateDto.bathrooms;
    if ('parkingSpaces' in updateDto && updateDto.parkingSpaces !== undefined) property.parkingSpaces = updateDto.parkingSpaces;

    // Atualiza o proprietário, se fornecido
    if (updateDto.ownerId) {
      const owner = await ownersService.findOne(updateDto.ownerId);
      if (!owner) {
        throw new NotFoundException(`Proprietário com ID ${updateDto.ownerId} não encontrado.`);
      }
      property.owner = owner;
    }

    // Atualiza o endereço, se fornecido
    if (updateDto.address) {
      const addressUpdate = updateDto.address;
      
      // Se tiver um novo CEP, consulta a API ViaCEP
      if (addressUpdate.zipCode) {
        try {
          const formattedCep = addressUpdate.zipCode.replace(/\D/g, '');
          const response: any = await firstValueFrom(httpService.get(`https://viacep.com.br/ws/${formattedCep}/json/`));

          if (response.data.erro) {
            throw new BadRequestException(`CEP ${addressUpdate.zipCode} não encontrado.`);
          }

          // Atualiza os dados do endereço com os dados da API
          property.address.zipCode = addressUpdate.zipCode;
          property.address.street = response.data.logradouro;
          property.address.neighborhood = response.data.bairro;
          property.address.city = response.data.localidade;
          property.address.state = response.data.uf;
        } catch (error) {
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new ServiceUnavailableException('Serviço de CEP indisponível. Tente novamente mais tarde.');
        }
      }

      // Atualiza o número e complemento, se fornecidos
      if (addressUpdate.number !== undefined) {
        property.address.number = addressUpdate.number;
      }
      if (addressUpdate.complement !== undefined) {
        property.address.complement = addressUpdate.complement;
      }
    }

    return repository.save(property);
  }

  async function remove(propertyId: number) {
    const property = await findOne(propertyId);
    await repository.delete(propertyId);
    return property;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProperty', () => {
    it('should create a new property', async () => {
      // Dados de teste
      const ownerId = 1;
      const createDto: CreatePropertyRequestDto = {
        address: {
          zipCode: '12345-678',
          number: 123,
          complement: 'Apto 101',
        },
        ownerId,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        offerType: OfferType.FOR_SALE,
        area: 120.5,
      };

      const owner = { ownerId, name: 'Owner Test', properties: [] };

      const addressData = new Address();
      addressData.zipCode = createDto.address.zipCode;
      addressData.street = viaCepMockResponse.logradouro;
      addressData.neighborhood = viaCepMockResponse.bairro;
      addressData.city = viaCepMockResponse.localidade;
      addressData.state = viaCepMockResponse.uf as State;
      
      const createdProperty = {
        propertyId: 1,
        ...createDto,
        owner,
        address: {
          ...addressData,
          number: createDto.address.number,
          complement: createDto.address.complement,
        },
        features: [],
        images: [],
        visits: [],
      };

      // Configuração dos mocks
      ownersService.findOne.mockResolvedValue(owner);
      repository.create.mockReturnValue(createdProperty);
      repository.save.mockResolvedValue(createdProperty);
      
      // Mock da função getAddressByCep
      jest.spyOn(service as any, 'getAddressByCep').mockResolvedValue(addressData);

      // Execução
      const result = await service.createProperty(createDto);

      // Verificações
      expect(ownersService.findOne).toHaveBeenCalledWith(ownerId);
      expect(service['getAddressByCep']).toHaveBeenCalledWith(createDto.address.zipCode);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        owner,
        address: expect.objectContaining({
          zipCode: createDto.address.zipCode,
          number: createDto.address.number,
          complement: createDto.address.complement,
        }),
      });
      expect(repository.save).toHaveBeenCalledWith(createdProperty);
      expect(result).toEqual(createdProperty);
    });

    it('should throw BadRequestException when CEP is not found', async () => {
      // Dados de teste
      const createDto: CreatePropertyRequestDto = {
        address: {
          zipCode: '00000-000',
          number: 123,
          complement: 'Apto 101',
        },
        ownerId: 1,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        offerType: OfferType.FOR_SALE,
        area: 120.5,
      };

      // Configuração dos mocks
      ownersService.findOne.mockResolvedValue({ ownerId: 1 });
      
      // Mock da função getAddressByCep para lançar BadRequestException
      jest.spyOn(service as any, 'getAddressByCep').mockRejectedValue(
        new BadRequestException('CEP não encontrado.')
      );

      // Execução e verificação
      await expect(service.createProperty(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.createProperty(createDto)).rejects.toThrow('CEP não encontrado.');
      expect(ownersService.findOne).toHaveBeenCalledWith(createDto.ownerId);
      expect(service['getAddressByCep']).toHaveBeenCalledWith(createDto.address.zipCode);
    });

    it('should throw ServiceUnavailableException when ViaCep service is unavailable', async () => {
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

      // Configuração dos mocks
      ownersService.findOne.mockResolvedValue({ ownerId: 1 });
      
      // Mock da função getAddressByCep para lançar ServiceUnavailableException
      jest.spyOn(service as any, 'getAddressByCep').mockRejectedValue(
        new ServiceUnavailableException('Serviço ViaCep indisponível no momento.')
      );

      // Execução e verificação
      await expect(service.createProperty(createDto)).rejects.toThrow(ServiceUnavailableException);
      await expect(service.createProperty(createDto)).rejects.toThrow('Serviço ViaCep indisponível no momento.');
      expect(ownersService.findOne).toHaveBeenCalledWith(createDto.ownerId);
      expect(service['getAddressByCep']).toHaveBeenCalledWith(createDto.address.zipCode);
    });
  });

  describe('findAll', () => {
    it('should return paginated properties without filters', async () => {
      // Mock da query de paginação
      const query: PaginateQuery = {
        path: '',
        page: 1,
        limit: 10,
      };
      
      // Mock da função paginate
      const { paginate } = require('nestjs-paginate');
      const mockPaginateResult = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
        },
        links: {}
      };

      paginate.mockReturnValue(mockPaginateResult);
      
      // Execução
      const result = await service.findAll(query);

      // Verificações
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('property');
      
      // Verificar que todas as junções são feitas corretamente
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('property.owner', 'owner');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('property.features', 'features');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('property.images', 'images');
      
      // Verificar que a função paginate é chamada com as configurações corretas
      expect(paginate).toHaveBeenCalledWith(query, expect.anything(), {
        sortableColumns: ['propertyId', 'price', 'area', 'registrationDate'],
        defaultSortBy: [['propertyId', 'DESC']],
        searchableColumns: ['address.city', 'address.neighborhood'],
        select: ['propertyId', 'price', 'area', 'status', 'offerType'],
        filterableColumns: {
          status: [FilterOperator.EQ],
          offerType: [FilterOperator.EQ],
          'owner.ownerId': [FilterOperator.EQ],
        },
      });
      
      // Verificar o retorno
      expect(result).toEqual(mockPaginateResult);
    });

    it('should apply filters when provided', async () => {
      // Mock da query de paginação
      const query: PaginateQuery = {
        path: '',
        page: 1,
        limit: 10,
      };
      
      // Mock dos filtros
      const filters: FilterPropertyRequestDto = {
        minPrice: 200000,
        maxPrice: 300000,
        minArea: 100,
        maxArea: 150,
        status: PropertyStatus.AVAILABLE,
        offerType: OfferType.FOR_SALE,
        ownerId: 1,
      };

      // Mock da função paginate
      const { paginate } = require('nestjs-paginate');
      const mockPaginateResult = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
        },
        links: {}
      };

      paginate.mockReturnValue(mockPaginateResult);

      // Execução
      const result = await service.findAll(query, filters);

      // Verificações
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('property');
      
      // Verificar que todas as junções são feitas corretamente
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('property.owner', 'owner');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('property.features', 'features');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('property.images', 'images');
      
      // Verificar que as condições de filtro são aplicadas corretamente
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('property.price >= :minPrice', { minPrice: filters.minPrice });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('property.price <= :maxPrice', { maxPrice: filters.maxPrice });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('property.area >= :minArea', { minArea: filters.minArea });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('property.area <= :maxArea', { maxArea: filters.maxArea });
      
      // Verificar que a função paginate é chamada com as configurações corretas
      expect(paginate).toHaveBeenCalledWith(query, expect.anything(), {
        sortableColumns: ['propertyId', 'price', 'area', 'registrationDate'],
        defaultSortBy: [['propertyId', 'DESC']],
        searchableColumns: ['address.city', 'address.neighborhood'],
        select: ['propertyId', 'price', 'area', 'status', 'offerType'],
        filterableColumns: {
          status: [FilterOperator.EQ],
          offerType: [FilterOperator.EQ],
          'owner.ownerId': [FilterOperator.EQ],
        },
      });
      
      // Verificar o retorno
      expect(result).toEqual(mockPaginateResult);
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
        address: {},
        owner: {},
        features: [],
        images: [],
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(property);

      // Execução
      const result = await service.findOne(propertyId);

      // Verificações
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { propertyId },
        relations: ['owner', 'features', 'features.featureType', 'images']
      });
      expect(result).toEqual(property);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      // Dados de teste
      const propertyId = 999;

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(null);

      // Execução e verificação
      await expect(service.findOne(propertyId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(propertyId)).rejects.toThrow(`Propriedade com ID ${propertyId} não encontrada`);
      
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { propertyId },
        relations: ['owner', 'features', 'features.featureType', 'images']
      });
    });
  });

  describe('update', () => {
    it('should update a property when it exists', async () => {
      // Dados de teste
      const propertyId = 1;
      const updateDto: UpdatePropertyRequestDto = {
        price: 300000,
        status: PropertyStatus.CONCLUDED,
      };
      const existingProperty = {
        propertyId,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        address: {},
        owner: {},
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        price: updateDto.price,
        status: updateDto.status,
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { propertyId },
        relations: ['owner', 'features', 'features.featureType', 'images']
      });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        propertyId,
        price: updateDto.price,
        status: updateDto.status,
      }));
      expect(result).toEqual(updatedProperty);
    });

    it('should update owner when ownerId is provided', async () => {
      // Dados de teste
      const propertyId = 1;
      const newOwnerId = 2;
      const updateDto: UpdatePropertyRequestDto = {
        ownerId: newOwnerId,
      };
      const newOwner = { ownerId: newOwnerId, name: 'New Owner' };
      const existingProperty = {
        propertyId,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        address: {},
        owner: { ownerId: 1, name: 'Old Owner' },
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        owner: newOwner,
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      ownersService.findOne.mockResolvedValue(newOwner);
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { propertyId },
        relations: ['owner', 'features', 'features.featureType', 'images']
      });
      expect(ownersService.findOne).toHaveBeenCalledWith(newOwnerId);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        owner: newOwner
      }));
      expect(result).toEqual(updatedProperty);
    });

    it('should update address when address is provided', async () => {
      // Dados de teste
      const propertyId = 1;
      const updateDto = {
        address: {
          zipCode: '12345-678',
          number: 456,
          complement: 'Casa',
        },
      } as UpdatePropertyRequestDto;
      const existingProperty = {
        propertyId,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        address: {
          zipCode: '87654-321',
          street: 'Rua Antiga',
          number: 123,
          complement: 'Apto',
          neighborhood: 'Bairro Antigo',
          city: 'Cidade Antiga',
          state: State.SP,
        },
        owner: { ownerId: 1 },
        features: [],
        images: [],
      };
      
      const addressData = new Address();
      addressData.zipCode = updateDto.address!.zipCode;
      addressData.street = viaCepMockResponse.logradouro;
      addressData.neighborhood = viaCepMockResponse.bairro;
      addressData.city = viaCepMockResponse.localidade;
      addressData.state = viaCepMockResponse.uf as State;
      
      const updatedProperty = {
        ...existingProperty,
        address: {
          ...addressData,
          number: updateDto.address!.number,
          complement: updateDto.address!.complement
        },
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      httpService.get.mockReturnValue(of({ data: viaCepMockResponse }));
      repository.save.mockResolvedValue(updatedProperty);
      
      // Mock da função getAddressByCep
      jest.spyOn(service as any, 'getAddressByCep').mockResolvedValue(addressData);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { propertyId },
        relations: ['owner', 'features', 'features.featureType', 'images']
      });
      expect(service['getAddressByCep']).toHaveBeenCalledWith(updateDto.address!.zipCode);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        address: expect.objectContaining({
          number: updateDto.address!.number,
          complement: updateDto.address!.complement,
        })
      }));
      expect(result).toEqual(updatedProperty);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      // Dados de teste
      const propertyId = 999;
      const updateDto: UpdatePropertyRequestDto = { price: 300000 };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(null);

      // Execução e verificação
      await expect(service.update(propertyId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(propertyId, updateDto)).rejects.toThrow(`Propriedade com ID ${propertyId} não encontrada`);
    });

    it('should update offerType when provided', async () => {
      // Dados de teste
      const propertyId = 1;
      const updateDto: UpdatePropertyRequestDto = {
        offerType: OfferType.FOR_RENTAL
      };
      const existingProperty = {
        propertyId,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        offerType: OfferType.FOR_SALE,
        area: 120,
        address: {},
        owner: {},
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        offerType: updateDto.offerType
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { propertyId },
        relations: ['owner', 'features', 'features.featureType', 'images']
      });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        propertyId,
        offerType: updateDto.offerType,
      }));
      expect(result.offerType).toEqual(OfferType.FOR_RENTAL);
    });

    it('should update area when provided', async () => {
      // Dados de teste
      const propertyId = 1;
      const updateDto: UpdatePropertyRequestDto = {
        area: 150.5
      };
      const existingProperty = {
        propertyId,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        offerType: OfferType.FOR_SALE,
        area: 120,
        address: {},
        owner: {},
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        area: updateDto.area
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { propertyId },
        relations: ['owner', 'features', 'features.featureType', 'images']
      });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        propertyId,
        area: updateDto.area,
      }));
      expect(result.area).toEqual(150.5);
    });

    it('should not update owner when ownerId is undefined', async () => {
      // Dados de teste
      const propertyId = 1;
      const updateDto: UpdatePropertyRequestDto = {
        price: 300000,
        // ownerId é undefined
      };
      const existingProperty = {
        propertyId,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        owner: { ownerId: 1, name: 'Original Owner' },
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        price: updateDto.price,
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.findOne).toHaveBeenCalled();
      expect(ownersService.findOne).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        price: updateDto.price,
        owner: existingProperty.owner // O owner não deve mudar
      }));
      expect(result.owner).toEqual(existingProperty.owner);
    });

    it('should not update price when price is undefined', async () => {
      // Dados de teste
      const propertyId = 1;
      const originalPrice = 250000;
      const updateDto: UpdatePropertyRequestDto = {
        status: PropertyStatus.CONCLUDED,
        // price é undefined
      };
      const existingProperty = {
        propertyId,
        price: originalPrice,
        status: PropertyStatus.AVAILABLE,
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        status: updateDto.status,
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        price: originalPrice, // O preço não deve mudar
        status: updateDto.status,
      }));
      expect(result.price).toEqual(originalPrice);
    });

    it('should not update status when status is undefined', async () => {
      // Dados de teste
      const propertyId = 1;
      const originalStatus = PropertyStatus.AVAILABLE;
      const updateDto: UpdatePropertyRequestDto = {
        price: 300000,
        // status é undefined
      };
      const existingProperty = {
        propertyId,
        price: 250000,
        status: originalStatus,
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        price: updateDto.price,
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        price: updateDto.price,
        status: originalStatus, // O status não deve mudar
      }));
      expect(result.status).toEqual(originalStatus);
    });

    it('should not update offerType when offerType is undefined', async () => {
      // Dados de teste
      const propertyId = 1;
      const originalOfferType = OfferType.FOR_SALE;
      const updateDto: UpdatePropertyRequestDto = {
        price: 300000,
        // offerType é undefined
      };
      const existingProperty = {
        propertyId,
        price: 250000,
        offerType: originalOfferType,
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        price: updateDto.price,
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        price: updateDto.price,
        offerType: originalOfferType, // O offerType não deve mudar
      }));
      expect(result.offerType).toEqual(originalOfferType);
    });

    it('should not update area when area is undefined', async () => {
      // Dados de teste
      const propertyId = 1;
      const originalArea = 120.5;
      const updateDto: UpdatePropertyRequestDto = {
        price: 300000,
        // area é undefined
      };
      const existingProperty = {
        propertyId,
        price: 250000,
        area: originalArea,
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        price: updateDto.price,
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await service.update(propertyId, updateDto);

      // Verificações
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        price: updateDto.price,
        area: originalArea, // A área não deve mudar
      }));
      expect(result.area).toEqual(originalArea);
    });
  });

  describe('remove', () => {
    it('should remove a property when it exists', async () => {
      // Dados de teste
      const propertyId = 1;
      const deleteResult = { affected: 1 };

      // Configuração dos mocks
      repository.delete.mockResolvedValue(deleteResult);

      // Execução
      await service.remove(propertyId);

      // Verificações
      expect(repository.delete).toHaveBeenCalledWith(propertyId);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      // Dados de teste
      const propertyId = 999;
      const deleteResult = { affected: 0 };

      // Configuração dos mocks
      repository.delete.mockResolvedValue(deleteResult);

      // Execução e verificação
      await expect(service.remove(propertyId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(propertyId)).rejects.toThrow(`Propriedade com ID ${propertyId} não encontrada`);
      
      // Verificar que a função foi chamada corretamente
      expect(repository.delete).toHaveBeenCalledWith(propertyId);
    });
  });

  // Para testar o método privado, precisamos acessá-lo através do objeto service
  describe('getAddressByCep', () => {
    it('should return address data when CEP is valid', async () => {
      // Dados de teste
      const cep = '12345-678';
      
      // Configuração dos mocks
      httpService.get.mockReturnValue(of({ data: viaCepMockResponse }));
      
      // Execução - usando Reflect para acessar o método privado
      const result = await Reflect.apply(
        service['getAddressByCep'], 
        service, 
        [cep]
      );
      
      // Verificações
      expect(httpService.get).toHaveBeenCalledWith(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      expect(result).toBeInstanceOf(Address);
      expect(result.zipCode).toBe(cep);
      expect(result.street).toBe(viaCepMockResponse.logradouro);
      expect(result.neighborhood).toBe(viaCepMockResponse.bairro);
      expect(result.city).toBe(viaCepMockResponse.localidade);
      expect(result.state).toBe(viaCepMockResponse.uf);
    });

    it('should throw BadRequestException when CEP is not found', async () => {
      // Dados de teste
      const cep = '00000-000';
      
      // Configuração dos mocks
      httpService.get.mockReturnValue(of({ data: { erro: true } }));
      
      // Execução e verificação
      await expect(
        Reflect.apply(service['getAddressByCep'], service, [cep])
      ).rejects.toThrow(BadRequestException);
      
      await expect(
        Reflect.apply(service['getAddressByCep'], service, [cep])
      ).rejects.toThrow('CEP não encontrado.');
      
      // Verificar que a função foi chamada corretamente
      expect(httpService.get).toHaveBeenCalledWith(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
    });

    it('should throw ServiceUnavailableException when ViaCep service is unavailable', async () => {
      // Dados de teste
      const cep = '12345-678';
      
      // Configuração dos mocks
      httpService.get.mockReturnValue(throwError(() => new Error('Service unavailable')));
      
      // Execução e verificação
      await expect(
        Reflect.apply(service['getAddressByCep'], service, [cep])
      ).rejects.toThrow(ServiceUnavailableException);
      
      await expect(
        Reflect.apply(service['getAddressByCep'], service, [cep])
      ).rejects.toThrow('Serviço ViaCep indisponível no momento.');
      
      // Verificar que a função foi chamada corretamente
      expect(httpService.get).toHaveBeenCalledWith(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
    });

    it('should handle null data in response', async () => {
      // Dados de teste
      const cep = '12345-678';
      
      // Configuração dos mocks - response.data é null
      httpService.get.mockReturnValue(of({ data: null }));
      
      // Execução e verificação
      await expect(
        Reflect.apply(service['getAddressByCep'], service, [cep])
      ).rejects.toThrow(ServiceUnavailableException);
      
      await expect(
        Reflect.apply(service['getAddressByCep'], service, [cep])
      ).rejects.toThrow('Serviço ViaCep indisponível no momento.');
      
      // Verificar que a função foi chamada corretamente
      expect(httpService.get).toHaveBeenCalledWith(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
    });

    it('should handle response with data but no erro property', async () => {
      // Dados de teste
      const cep = '12345-678';
      
      // Configuração dos mocks - response.data existe mas não tem a propriedade erro
      const responseWithoutErro = {
        data: {
          // Sem a propriedade erro
          cep: '12345-678',
          logradouro: 'Rua Teste',
          bairro: 'Bairro Teste',
          localidade: 'São Paulo',
          uf: 'SP'
        }
      };
      httpService.get.mockReturnValue(of(responseWithoutErro));
      
      // Execução
      const result = await Reflect.apply(service['getAddressByCep'], service, [cep]);
      
      // Verificações
      expect(result).toBeInstanceOf(Address);
      expect(result.zipCode).toBe(cep);
      expect(result.street).toBe(responseWithoutErro.data.logradouro);
      expect(result.neighborhood).toBe(responseWithoutErro.data.bairro);
      expect(result.city).toBe(responseWithoutErro.data.localidade);
      expect(result.state).toBe(responseWithoutErro.data.uf);
      
      // Verificar que a função foi chamada corretamente
      expect(httpService.get).toHaveBeenCalledWith(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
    });

    it('should handle response with undefined data property', async () => {
      // Dados de teste
      const cep = '12345-678';
      
      // Configuração dos mocks - response sem a propriedade data
      const responseWithoutData = {};
      httpService.get.mockReturnValue(of(responseWithoutData));
      
      // Execução e verificação
      await expect(
        Reflect.apply(service['getAddressByCep'], service, [cep])
      ).rejects.toThrow(ServiceUnavailableException);
      
      await expect(
        Reflect.apply(service['getAddressByCep'], service, [cep])
      ).rejects.toThrow('Serviço ViaCep indisponível no momento.');
      
      // Verificar que a função foi chamada corretamente
      expect(httpService.get).toHaveBeenCalledWith(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
    });
  });
}); 
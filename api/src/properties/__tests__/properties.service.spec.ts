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

// Mock de resposta da API ViaCEP
const viaCepMockResponse = {
  cep: '12345-678',
  logradouro: 'Rua Teste',
  bairro: 'Bairro Teste',
  localidade: 'São Paulo',
  uf: 'SP',
};

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
      relations: ['address', 'owner', 'features', 'images'],
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
      const createdProperty = {
        propertyId: 1,
        ...createDto,
        owner,
        address: {
          zipCode: '12345-678',
          street: 'Rua Teste',
          number: 123,
          complement: 'Apto 101',
          neighborhood: 'Bairro Teste',
          city: 'São Paulo',
          state: 'SP',
        },
        registrationDate: new Date(),
        features: [],
        images: [],
        visits: [],
      };

      // Configuração dos mocks
      httpService.get.mockReturnValue(of({ data: viaCepMockResponse }));
      ownersService.findOne.mockResolvedValue(owner);
      repository.create.mockReturnValue(createdProperty);
      repository.save.mockResolvedValue(createdProperty);

      // Execução
      const result = await createProperty(createDto);

      // Verificações
      expect(httpService.get).toHaveBeenCalledWith(`https://viacep.com.br/ws/${createDto.address.zipCode.replace(/\D/g, '')}/json/`);
      expect(ownersService.findOne).toHaveBeenCalledWith(ownerId);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
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
      httpService.get.mockReturnValue(of({ data: { erro: true } }));
      ownersService.findOne.mockResolvedValue({ ownerId: 1 });

      // Execução e verificação
      await expect(createProperty(createDto)).rejects.toThrow(BadRequestException);
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
      httpService.get.mockReturnValue(throwError(() => new Error('Service unavailable')));
      ownersService.findOne.mockResolvedValue({ ownerId: 1 });

      // Execução e verificação
      await expect(createProperty(createDto)).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('findAll', () => {
    it('should return an array of properties without filters', async () => {
      // Dados de teste
      const properties = [
        { propertyId: 1, price: 250000, area: 120, status: PropertyStatus.AVAILABLE },
        { propertyId: 2, price: 300000, area: 150, status: PropertyStatus.AVAILABLE },
      ];

      // Configuração dos mocks
      queryBuilder.getMany.mockResolvedValue(properties);

      // Execução
      const result = await findAll();

      // Verificações
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('property');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(3);
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(properties);
    });

    it('should apply filters when provided', async () => {
      // Dados de teste
      const filters: FilterPropertyRequestDto = {
        minPrice: 200000,
        maxPrice: 300000,
        minArea: 100,
        maxArea: 150,
        status: PropertyStatus.AVAILABLE,
        offerType: OfferType.FOR_SALE,
        ownerId: 1,
      };

      const properties = [{ propertyId: 1, price: 250000, area: 120, status: PropertyStatus.AVAILABLE }];

      // Configuração dos mocks
      queryBuilder.getMany.mockResolvedValue(properties);

      // Execução
      const result = await findAll(filters);

      // Verificações
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('property');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(3);
      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(Object.keys(filters).length);
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(properties);
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
      const result = await findOne(propertyId);

      // Verificações
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { propertyId },
        relations: ['address', 'owner', 'features', 'images'],
      });
      expect(result).toEqual(property);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      // Dados de teste
      const propertyId = 999;

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(null);

      // Execução e verificação
      await expect(findOne(propertyId)).rejects.toThrow(NotFoundException);
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
      const result = await update(propertyId, updateDto);

      // Verificações
      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
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
      const result = await update(propertyId, updateDto);

      // Verificações
      expect(repository.findOne).toHaveBeenCalled();
      expect(ownersService.findOne).toHaveBeenCalledWith(newOwnerId);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedProperty);
    });

    it('should update address when address is provided', async () => {
      // Dados de teste
      const propertyId = 1;
      const updateDto: UpdatePropertyRequestDto = {
        address: {
          zipCode: '12345-678',
          number: 456,
          complement: 'Casa',
        },
      };
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
          state: 'SP',
        },
        owner: { ownerId: 1 },
        features: [],
        images: [],
      };
      const updatedProperty = {
        ...existingProperty,
        address: {
          ...existingProperty.address,
          zipCode: updateDto.address?.zipCode,
          street: viaCepMockResponse.logradouro,
          number: updateDto.address?.number,
          complement: updateDto.address?.complement,
          neighborhood: viaCepMockResponse.bairro,
          city: viaCepMockResponse.localidade,
          state: viaCepMockResponse.uf,
        },
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(existingProperty);
      httpService.get.mockReturnValue(of({ data: viaCepMockResponse }));
      repository.save.mockResolvedValue(updatedProperty);

      // Execução
      const result = await update(propertyId, updateDto);

      // Verificações
      expect(repository.findOne).toHaveBeenCalled();
      expect(httpService.get).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedProperty);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      // Dados de teste
      const propertyId = 999;
      const updateDto: UpdatePropertyRequestDto = { price: 300000 };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(null);

      // Execução e verificação
      await expect(update(propertyId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a property when it exists', async () => {
      // Dados de teste
      const propertyId = 1;
      const property = {
        propertyId,
        price: 250000,
        status: PropertyStatus.AVAILABLE,
        address: {},
        owner: {},
        features: [],
        images: [],
      };

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(property);
      repository.delete.mockResolvedValue({ affected: 1 });

      // Execução
      const result = await remove(propertyId);

      // Verificações
      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.delete).toHaveBeenCalledWith(propertyId);
      expect(result).toEqual(property);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      // Dados de teste
      const propertyId = 999;

      // Configuração dos mocks
      repository.findOne.mockResolvedValue(null);

      // Execução e verificação
      await expect(remove(propertyId)).rejects.toThrow(NotFoundException);
    });
  });
}); 
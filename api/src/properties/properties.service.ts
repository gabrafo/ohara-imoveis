import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyRequestDto } from './dto/request/create-property.request.dto';
import { HttpService } from '@nestjs/axios';
import { Address } from './addresses/entities/address.entity';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { OwnersService } from 'src/owners/owners.service';
import { UpdatePropertyRequestDto } from './dto/request/update-property.request.dto';
import { FilterPropertyRequestDto } from './dto/request/filter-property.request.dto';
import { FilterOperator, paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    private readonly httpService: HttpService,
    private readonly ownersService: OwnersService
  ) {}

  async createProperty(createPropertyDto: CreatePropertyRequestDto): Promise<Property> {
    const owner = await this.ownersService.findOne(createPropertyDto.ownerId);
    
    const addressData = await this.getAddressByCep(createPropertyDto.address.zipCode);
    
    const property = this.propertiesRepository.create({
      ...createPropertyDto,
      owner,
      address: {
        ...addressData,
        number: createPropertyDto.address.number,
        complement: createPropertyDto.address.complement
      }
    });

    return this.propertiesRepository.save(property);
  }

  async findAll(query: PaginateQuery, filters?: FilterPropertyRequestDto): Promise<Paginated<Property>> {
    const queryBuilder = this.propertiesRepository.createQueryBuilder('property')
      .leftJoinAndSelect('property.owner', 'owner')
      .leftJoinAndSelect('property.features', 'features')
      .leftJoinAndSelect('property.images', 'images');

    if (filters?.minPrice) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice: filters.minPrice });
    }
    
    if (filters?.maxPrice) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
    
    if (filters?.minArea) {
      queryBuilder.andWhere('property.area >= :minArea', { minArea: filters.minArea });
    }
    
    if (filters?.maxArea) {
      queryBuilder.andWhere('property.area <= :maxArea', { maxArea: filters.maxArea });
    }

    return paginate(query, queryBuilder, {
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
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { propertyId: id },
      relations: ['owner', 'features', 'features.featureType', 'images']
    });

    if (!property) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada`);
    }

    return property;
  }

  async update(id: number, updatePropertyDto: UpdatePropertyRequestDto): Promise<Property> {
    const property = await this.findOne(id);
    
    if (updatePropertyDto.ownerId) {
      const owner = await this.ownersService.findOne(updatePropertyDto.ownerId);
      property.owner = owner;
    }
    
    // Se houver atualização do endereço, processar as informações
    if (updatePropertyDto.address) {
      const addressData = await this.getAddressByCep(updatePropertyDto.address.zipCode);
      property.address = {
        ...addressData,
        number: updatePropertyDto.address.number,
        complement: updatePropertyDto.address.complement
      };
    }
    
    // Atualizar os outros campos
    if (updatePropertyDto.price !== undefined) {
      property.price = updatePropertyDto.price;
    }
    
    if (updatePropertyDto.status !== undefined) {
      property.status = updatePropertyDto.status;
    }
    
    if (updatePropertyDto.offerType !== undefined) {
      property.offerType = updatePropertyDto.offerType;
    }
    
    if (updatePropertyDto.area !== undefined) {
      property.area = updatePropertyDto.area;
    }
    
    // Salvar e retornar a propriedade atualizada
    return this.propertiesRepository.save(property);
  }

  async remove(id: number): Promise<void> {
    const result = await this.propertiesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada`);
    }
  }

  private async getAddressByCep(cep: string): Promise<Address> {
    const formattedCep = cep.replace(/\D/g, '');
    const url = `https://viacep.com.br/ws/${formattedCep}/json/`;
    
    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url));
      
      if (response.data?.erro) {
        throw new BadRequestException('CEP não encontrado.');
      }
      
      const address = new Address();
      address.zipCode = cep;
      address.street = response.data.logradouro;
      address.neighborhood = response.data.bairro;
      address.city = response.data.localidade;
      address.state = response.data.uf;
      
      return address;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new ServiceUnavailableException('Serviço ViaCep indisponível no momento.');
    }
  }
}
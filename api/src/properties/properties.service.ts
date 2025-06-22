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

  async findAll(filters?: FilterPropertyRequestDto): Promise<Property[]> {
    const queryBuilder = this.propertiesRepository.createQueryBuilder('property')
      .leftJoinAndSelect('property.owner', 'owner')
      .leftJoinAndSelect('property.features', 'features')
      .leftJoinAndSelect('property.images', 'images');

    if (filters) {
      if (filters.minPrice) {
        queryBuilder.andWhere('property.price >= :minPrice', { minPrice: filters.minPrice });
      }
      
      if (filters.maxPrice) {
        queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: filters.maxPrice });
      }
      
      if (filters.minArea) {
        queryBuilder.andWhere('property.area >= :minArea', { minArea: filters.minArea });
      }
      
      if (filters.maxArea) {
        queryBuilder.andWhere('property.area <= :maxArea', { maxArea: filters.maxArea });
      }
      
      if (filters.status) {
        queryBuilder.andWhere('property.status = :status', { status: filters.status });
      }
      
      if (filters.offerType) {
        queryBuilder.andWhere('property.offerType = :offerType', { offerType: filters.offerType });
      }
      
      if (filters.ownerId) {
        queryBuilder.andWhere('property.owner.ownerId = :ownerId', { ownerId: filters.ownerId });
      }
    }

    return queryBuilder.getMany();
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
      
      // Converter resposta da API para o formato da entidade Address
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
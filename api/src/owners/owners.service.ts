import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Owner } from './entities/owner.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOwnerDto } from './dto/request/create-owner.dto';
import { Repository } from 'typeorm';
import { UpdateOwnerDto } from './dto/request/update-owner.dto';

@Injectable()
export class OwnersService {
  constructor(
    @InjectRepository(Owner)
    private ownersRepository: Repository<Owner>,
  ) {}

  async createOwner(createOwnerDto: CreateOwnerDto): Promise<Owner> {
    const existingOwner = await this.findOwnerByCpf(createOwnerDto.cpf);
    if (existingOwner) {
      throw new BadRequestException('CPF já cadastrado.');
    }
    const owner = this.ownersRepository.create(createOwnerDto);
    return this.ownersRepository.save(owner);
  }

  async findAll(): Promise<Owner[]> {
    return this.ownersRepository.find();
  }

  async findOne(id: number): Promise<Owner> {
    const owner = await this.ownersRepository.findOne({ where: { ownerId: id } });
    if (!owner) {
      throw new NotFoundException(`Proprietário com ID ${id} não encontrado.`);
    }
    return owner;
  }

  async findByCpf(cpf: string): Promise<Owner> {
    const owner = await this.findOwnerByCpf(cpf);
    if (!owner) {
      throw new NotFoundException(`Proprietário com CPF ${cpf} não encontrado.`);
    }
    return owner;
  }

  // Método privado para buscar sem lançar exceção
  private async findOwnerByCpf(cpf: string): Promise<Owner | null> {
    return this.ownersRepository.findOne({ where: { cpf } });
  }

  async update(id: number, updateOwnerDto: UpdateOwnerDto): Promise<Owner> {
    const owner = await this.findOne(id);
    
    if (updateOwnerDto.cpf) {
      const existingOwner = await this.findOwnerByCpf(updateOwnerDto.cpf);
      if (existingOwner && existingOwner.ownerId !== id) {
        throw new BadRequestException('CPF já cadastrado.');
      }
    }
    
    const updatedOwner = this.ownersRepository.merge(owner, updateOwnerDto);
    return this.ownersRepository.save(updatedOwner);
  }

  async delete(id: number): Promise<void> {
    const result = await this.ownersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Proprietário com ID ${id} não encontrado.`);
    }
  }
}
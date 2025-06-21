import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OwnersService } from '../owners.service';
import { Owner } from '../entities/owner.entity';
import { CreateOwnerDto } from '../dto/request/create-owner.dto';
import { UpdateOwnerDto } from '../dto/request/update-owner.dto';

describe('OwnersService', () => {
  let service: OwnersService;
  let repository: Repository<Owner>;

  const mockOwner: Owner = {
    ownerId: 1,
    name: 'João da Silva',
    contactPhone: '(11) 91234-5678',
    cpf: '123.456.789-00',
    properties: []
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnersService,
        {
          provide: getRepositoryToken(Owner),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OwnersService>(OwnersService);
    repository = module.get<Repository<Owner>>(getRepositoryToken(Owner));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOwner', () => {
    const createOwnerDto: CreateOwnerDto = {
      name: 'João da Silva',
      contactPhone: '(11) 91234-5678',
      cpf: '123.456.789-00',
    };

    it('should create a new owner successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockOwner);
      mockRepository.save.mockResolvedValue(mockOwner);

      const result = await service.createOwner(createOwnerDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { cpf: createOwnerDto.cpf } });
      expect(mockRepository.create).toHaveBeenCalledWith(createOwnerDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockOwner);
      expect(result).toEqual(mockOwner);
    });

    it('should throw BadRequestException when CPF already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockOwner);

      await expect(service.createOwner(createOwnerDto)).rejects.toThrow(
        new BadRequestException('CPF já cadastrado.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { cpf: createOwnerDto.cpf } });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of owners', async () => {
      const mockOwners = [mockOwner];
      mockRepository.find.mockResolvedValue(mockOwners);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockOwners);
    });

    it('should return an empty array when no owners exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an owner when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockOwner);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { ownerId: 1 } });
      expect(result).toEqual(mockOwner);
    });

    it('should throw NotFoundException when owner not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('Proprietário com ID 1 não encontrado.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { ownerId: 1 } });
    });
  });

  describe('findByCpf', () => {
    it('should return an owner when found by CPF', async () => {
      mockRepository.findOne.mockResolvedValue(mockOwner);

      const result = await service.findByCpf('123.456.789-00');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { cpf: '123.456.789-00' } });
      expect(result).toEqual(mockOwner);
    });

    it('should throw NotFoundException when owner not found by CPF', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByCpf('123.456.789-00')).rejects.toThrow(
        new NotFoundException('Proprietário com CPF 123.456.789-00 não encontrado.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { cpf: '123.456.789-00' } });
    });
  });

  describe('update', () => {
    const updateOwnerDto: UpdateOwnerDto = {
      name: 'João Silva Atualizado',
      contactPhone: '(11) 99999-9999',
      cpf: '987.654.321-00',
    };

    it('should update an owner successfully', async () => {
      const updatedOwner = { ...mockOwner, ...updateOwnerDto };
      mockRepository.findOne
        .mockResolvedValueOnce(mockOwner) 
        .mockResolvedValueOnce(null); 
      mockRepository.merge.mockReturnValue(updatedOwner);
      mockRepository.save.mockResolvedValue(updatedOwner);

      const result = await service.update(1, updateOwnerDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { ownerId: 1 } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { cpf: updateOwnerDto.cpf } });
      expect(mockRepository.merge).toHaveBeenCalledWith(mockOwner, updateOwnerDto);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedOwner);
      expect(result).toEqual(updatedOwner);
    });

    it('should update an owner without CPF change', async () => {
      const updateWithoutCpf: UpdateOwnerDto = {
        name: 'João Silva Atualizado',
        contactPhone: '(11) 99999-9999',
      };
      const updatedOwner = { ...mockOwner, ...updateWithoutCpf };
      mockRepository.findOne.mockResolvedValue(mockOwner);
      mockRepository.merge.mockReturnValue(updatedOwner);
      mockRepository.save.mockResolvedValue(updatedOwner);

      const result = await service.update(1, updateWithoutCpf);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { ownerId: 1 } });
      expect(mockRepository.merge).toHaveBeenCalledWith(mockOwner, updateWithoutCpf);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedOwner);
      expect(result).toEqual(updatedOwner);
    });

    it('should throw NotFoundException when owner to update not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateOwnerDto)).rejects.toThrow(
        new NotFoundException('Proprietário com ID 1 não encontrado.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { ownerId: 1 } });
      expect(mockRepository.merge).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when CPF already exists for another owner', async () => {
      const anotherOwner = { ...mockOwner, ownerId: 2 };
      mockRepository.findOne
        .mockResolvedValueOnce(mockOwner) 
        .mockResolvedValueOnce(anotherOwner); 

      await expect(service.update(1, updateOwnerDto)).rejects.toThrow(
        new BadRequestException('CPF já cadastrado.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { ownerId: 1 } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { cpf: updateOwnerDto.cpf } });
      expect(mockRepository.merge).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should update owner when CPF belongs to the same owner', async () => {
      const updateWithSameCpf: UpdateOwnerDto = {
        name: 'João Silva Atualizado',
        cpf: '123.456.789-00',
      };
      const updatedOwner = { ...mockOwner, ...updateWithSameCpf };
      mockRepository.findOne
        .mockResolvedValueOnce(mockOwner) 
        .mockResolvedValueOnce(mockOwner); 
      mockRepository.merge.mockReturnValue(updatedOwner);
      mockRepository.save.mockResolvedValue(updatedOwner);

      const result = await service.update(1, updateWithSameCpf);

      expect(result).toEqual(updatedOwner);
    });

    it('should update an owner without sending cpf property', async () => {
      const ownerId = 1;
      const updateDto = {
        name: 'Updated Name',
        contactPhone: '(11) 99999-9999',
        properties: []
      };

      const existingOwner = {
        ownerId,
        name: 'Original Name',
        cpf: '72167373070',
        contactPhone: '(11) 99999-9999',
        properties: []
      };

      const updatedOwner = {
        ...existingOwner,
        name: updateDto.name,
      };

      const findOneSpy = jest.spyOn(repository, 'findOne');
      findOneSpy.mockImplementationOnce(() => Promise.resolve(existingOwner));
      findOneSpy.mockImplementationOnce(() => Promise.resolve(null));

      const mergeSpy = jest.spyOn(repository, 'merge');
      mergeSpy.mockImplementation((user, dto) => ({
        ...user,
        ...dto,
        ownerId: user.ownerId,
        name: dto.name ?? user.name,
        contactPhone: dto.contactPhone ?? user.contactPhone,
        cpf: dto.cpf ?? user.cpf,
        properties: user.properties,
      }));

      const saveSpy = jest.spyOn(repository, 'save');
      saveSpy.mockResolvedValue(updatedOwner);

      const result = await service.update(ownerId, updateDto);

      expect(findOneSpy).toHaveBeenCalledWith({ where: { ownerId } });
      expect(mergeSpy).toHaveBeenCalledWith(existingOwner, updateDto);
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        ownerId,
        name: 'Updated Name',
        cpf: '72167373070',
        contactPhone: '(11) 99999-9999',
        properties: []
      }));
      expect(result).toEqual(updatedOwner);
    });
  });

  describe('delete', () => {
    it('should delete an owner successfully', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when owner to delete not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(1)).rejects.toThrow(
        new NotFoundException('Proprietário com ID 1 não encontrado.')
      );

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
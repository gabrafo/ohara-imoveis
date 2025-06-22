import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OwnersController } from '../owners.controller';
import { OwnersService } from '../owners.service';
import { CreateOwnerDto } from '../dto/request/create-owner.dto';
import { UpdateOwnerDto } from '../dto/request/update-owner.dto';
import { Owner } from '../entities/owner.entity';

describe('OwnersController', () => {
  let controller: OwnersController;
  let service: jest.Mocked<OwnersService>;

  const mockOwner: Owner = {
    ownerId: 1,
    cpf: '37420793018',
    name: 'João Silva',
    contactPhone: '(11) 99999-9999',
    properties: []
  };

  const mockOwnersService = {
    createOwner: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCpf: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnersController],
      providers: [
        {
          provide: OwnersService,
          useValue: mockOwnersService,
        },
      ],
    }).compile();

    controller = module.get<OwnersController>(OwnersController);
    service = module.get<OwnersService>(OwnersService) as jest.Mocked<OwnersService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOwnerDto: CreateOwnerDto = {
      cpf: '12345678901',
      name: 'João Silva',
      contactPhone: '(11) 99999-9999',
    };

    it('should create a new owner', async () => {
      service.createOwner.mockResolvedValue(mockOwner);

      const result = await controller.create(createOwnerDto);

      expect(service.createOwner).toHaveBeenCalledWith(createOwnerDto);
      expect(result).toEqual(mockOwner);
    });

    it('should throw BadRequestException when CPF already exists', async () => {
      service.createOwner.mockRejectedValue(new BadRequestException('CPF já cadastrado.'));

      await expect(controller.create(createOwnerDto)).rejects.toThrow(
        new BadRequestException('CPF já cadastrado.')
      );

      expect(service.createOwner).toHaveBeenCalledWith(createOwnerDto);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      service.createOwner.mockRejectedValue(error);

      await expect(controller.create(createOwnerDto)).rejects.toThrow(error);

      expect(service.createOwner).toHaveBeenCalledWith(createOwnerDto);
    });
  });

  describe('findAll', () => {
    it('should return all owners', async () => {
      const mockOwners = [mockOwner, { ...mockOwner, ownerId: 2, cpf: '98765432100' }];
      service.findAll.mockResolvedValue(mockOwners);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockOwners);
    });

    it('should return empty array when no owners exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);

      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return owner by id', async () => {
      service.findOne.mockResolvedValue(mockOwner);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOwner);
    });

    it('should throw NotFoundException when owner not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Proprietário com ID 999 não encontrado.')
      );

      await expect(controller.findOne(999)).rejects.toThrow(
        new NotFoundException('Proprietário com ID 999 não encontrado.')
      );

      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle string id parameter', async () => {
      service.findOne.mockResolvedValue(mockOwner);

      const result = await controller.findOne('1' as any);

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockOwner);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne(1)).rejects.toThrow(error);

      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByCpf', () => {
    it('should return owner by CPF', async () => {
      service.findByCpf.mockResolvedValue(mockOwner);

      const result = await controller.findByCpf('12345678901');

      expect(service.findByCpf).toHaveBeenCalledWith('12345678901');
      expect(result).toEqual(mockOwner);
    });

    it('should throw NotFoundException when owner not found by CPF', async () => {
      service.findByCpf.mockRejectedValue(
        new NotFoundException('Proprietário com CPF 99999999999 não encontrado.')
      );

      await expect(controller.findByCpf('99999999999')).rejects.toThrow(
        new NotFoundException('Proprietário com CPF 99999999999 não encontrado.')
      );

      expect(service.findByCpf).toHaveBeenCalledWith('99999999999');
    });

    it('should handle CPF with special characters', async () => {
      service.findByCpf.mockResolvedValue(mockOwner);

      const result = await controller.findByCpf('123.456.789-01');

      expect(service.findByCpf).toHaveBeenCalledWith('123.456.789-01');
      expect(result).toEqual(mockOwner);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      service.findByCpf.mockRejectedValue(error);

      await expect(controller.findByCpf('12345678901')).rejects.toThrow(error);

      expect(service.findByCpf).toHaveBeenCalledWith('12345678901');
    });
  });

  describe('update', () => {
    const updateOwnerDto: UpdateOwnerDto = {
      name: 'João Silva Updated',
      contactPhone: '(11) 99999-9999',
      cpf: '37420793018',
    };

    it('should update owner successfully', async () => {
      const updatedOwner = { ...mockOwner, ...updateOwnerDto };
      service.update.mockResolvedValue(updatedOwner);

      const result = await controller.update(1, updateOwnerDto);

      expect(service.update).toHaveBeenCalledWith(1, updateOwnerDto);
      expect(result).toEqual(updatedOwner);
    });

    it('should throw NotFoundException when owner to update not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Proprietário com ID 999 não encontrado.')
      );

      await expect(controller.update(999, updateOwnerDto)).rejects.toThrow(
        new NotFoundException('Proprietário com ID 999 não encontrado.')
      );

      expect(service.update).toHaveBeenCalledWith(999, updateOwnerDto);
    });

    it('should throw BadRequestException when updating to existing CPF', async () => {
      service.update.mockRejectedValue(new BadRequestException('CPF já cadastrado.'));

      await expect(controller.update(1, { ...updateOwnerDto, cpf: '98765432100' })).rejects.toThrow(
        new BadRequestException('CPF já cadastrado.')
      );

      expect(service.update).toHaveBeenCalledWith(1, { ...updateOwnerDto, cpf: '98765432100' });
    });

    it('should handle string id parameter', async () => {
      const updatedOwner = { ...mockOwner, ...updateOwnerDto };
      service.update.mockResolvedValue(updatedOwner);

      const result = await controller.update('1' as any, updateOwnerDto);

      expect(service.update).toHaveBeenCalledWith('1', updateOwnerDto);
      expect(result).toEqual(updatedOwner);
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateOwnerDto = { name: 'New Name Only', contactPhone: '(11) 99999-9999', cpf: '37420793018' };
      const updatedOwner = { ...mockOwner, name: 'New Name Only' };
      service.update.mockResolvedValue(updatedOwner);

      const result = await controller.update(1, partialUpdate);

      expect(service.update).toHaveBeenCalledWith(1, partialUpdate);
      expect(result).toEqual(updatedOwner);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      service.update.mockRejectedValue(error);

      await expect(controller.update(1, updateOwnerDto)).rejects.toThrow(error);

      expect(service.update).toHaveBeenCalledWith(1, updateOwnerDto);
    });
  });

  describe('delete', () => {
    it('should delete owner successfully', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete(1);

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when owner to delete not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Proprietário com ID 999 não encontrado.')
      );

      await expect(controller.delete(999)).rejects.toThrow(
        new NotFoundException('Proprietário com ID 999 não encontrado.')
      );

      expect(service.delete).toHaveBeenCalledWith(999);
    });

    it('should handle string id parameter', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete('1' as any);

      expect(service.delete).toHaveBeenCalledWith('1');
      expect(result).toBeUndefined();
    });

    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      service.delete.mockRejectedValue(error);

      await expect(controller.delete(1)).rejects.toThrow(error);

      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RegisterRequestDto } from 'src/auth/dto/request/register.request.dto';
import { UpdateUserDto } from '../dto/request/update-user.request.dto';
import { Role } from 'src/common/enums/role.enum';

// Mock para o repositório TypeORM
const mockRepository = () => {
  const queryBuilderMock = {
    where: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn()
  };
  
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilderMock),
    increment: jest.fn().mockResolvedValue({ affected: 1 }),
  };
};

type MockRepository<T extends ObjectLiteral = any> = ReturnType<typeof mockRepository>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;
  let queryBuilder: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<MockRepository<User>>(getRepositoryToken(User));
    queryBuilder = repository.createQueryBuilder();
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmailWithPassword', () => {
    it('should return a user with password and token version', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockedUser = {
        userId: 1,
        email,
        password: 'hashedPassword',
        tokenVersion: 1,
      } as User;

      queryBuilder.getOne.mockResolvedValue(mockedUser);

      // Act
      const result = await service.findByEmailWithPassword(email);

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email });
      expect(queryBuilder.addSelect).toHaveBeenCalledTimes(2);
      expect(queryBuilder.addSelect).toHaveBeenNthCalledWith(1, 'user.password');
      expect(queryBuilder.addSelect).toHaveBeenNthCalledWith(2, 'user.tokenVersion');
      expect(result).toEqual(mockedUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      
      queryBuilder.getOne.mockResolvedValue(null);

      // Act
      const result = await service.findByEmailWithPassword(email);

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id with token version', async () => {
      // Arrange
      const userId = 1;
      const mockedUser = {
        userId,
        email: 'test@example.com',
        tokenVersion: 1,
      } as User;

      queryBuilder.getOne.mockResolvedValue(mockedUser);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.userId = :userId', { userId });
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.tokenVersion');
      expect(result).toEqual(mockedUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      const userId = 999;
      
      queryBuilder.getOne.mockResolvedValue(null);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.userId = :userId', { userId });
      expect(result).toBeNull();
    });
  });

  describe('incrementTokenVersion', () => {
    it('should increment the token version by 1', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      await service.incrementTokenVersion(userId);

      // Assert
      expect(repository.increment).toHaveBeenCalledWith(
        { userId },
        'tokenVersion',
        1
      );
    });
  });

  describe('findByPhone', () => {
    it('should return a user by phone number', async () => {
      // Arrange
      const phone = '+5511999999999';
      const mockedUser = {
        userId: 1,
        phone,
      } as User;

      repository.findOne.mockResolvedValue(mockedUser);

      // Act
      const result = await service.findByPhone(phone);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { phone } });
      expect(result).toEqual(mockedUser);
    });

    it('should return null when phone number is not found', async () => {
      // Arrange
      const phone = '+5511999999999';
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByPhone(phone);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { phone } });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return a user', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const existingUser = {
        userId,
        name: 'Old Name',
      } as User;

      const updatedUser = {
        userId,
        name: updateUserDto.name,
      } as User;

      // Mock o método findById
      jest.spyOn(service, 'findById').mockResolvedValue(existingUser);
      repository.merge.mockReturnValue(updatedUser);
      repository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(userId);
      expect(repository.merge).toHaveBeenCalledWith(existingUser, updateUserDto);
      expect(repository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException with correct message when user does not exist', async () => {
      // Arrange
      const userId = 999;
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const expectedErrorMessage = `Usuário com ID ${userId} não encontrado.`;

      // Mock o método findById para retornar null
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      // Act & Assert
      try {
        await service.update(userId, updateUserDto);
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(expectedErrorMessage);
      }
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockedUser = {
        userId: 1,
        email,
      } as User;

      repository.findOne.mockResolvedValue(mockedUser);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(mockedUser);
    });

    it('should return null when email is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const createUserDto: RegisterRequestDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+5511999999999',
        birthDate: '15-07-1990',
      };

      // Precisamos criar uma instância com as propriedades adequadas
      const userInstance = {
        userId: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        phone: createUserDto.phone,
        birthDate: createUserDto.birthDate,
        hashPassword: jest.fn(),
        parseBirthDate: jest.fn(),
        tokenVersion: 0,
        visits: [],
      } as unknown as User;

      repository.create.mockReturnValue(userInstance);
      repository.save.mockResolvedValue(userInstance);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(userInstance);
      expect(result).toEqual(userInstance);
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      // Arrange
      const userId = 1;
      
      repository.delete.mockResolvedValue({ affected: 1 });

      // Act
      await service.delete(userId);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException with correct message when user to delete does not exist', async () => {
      // Arrange
      const userId = 999;
      const expectedErrorMessage = `Usuário com ID ${userId} não encontrado.`;
      
      repository.delete.mockResolvedValue({ affected: 0 });

      // Act & Assert
      try {
        await service.delete(userId);
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(expectedErrorMessage);
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      // Arrange
      const users = [
        { userId: 1, name: 'User 1' },
        { userId: 2, name: 'User 2' },
      ] as User[];
      
      repository.find.mockResolvedValue(users);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return an empty array when no users exist', async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
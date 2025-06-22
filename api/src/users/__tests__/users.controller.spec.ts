import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { HttpStatus } from '@nestjs/common';
import { User } from '../entities/users.entity';
import { Role } from 'src/common/enums/role.enum';
import { CreateUserDto } from '../dto/request/create-user.request.dto';
import { UpdateUserDto } from '../dto/request/update-user.request.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    
    // Reset mocks entre cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and return user response dto', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+5511999999999',
        birthDate: '15-07-1990',
        role: Role.ADMIN,
      };

      const createdUser = {
        userId: 1,
        ...createUserDto,
        password: 'hashedPassword',
        tokenVersion: 1,
      };

      mockUsersService.create.mockResolvedValue(createdUser);

      // Act
      const result = await controller.create(createUserDto);

      // Assert
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expect.objectContaining({
        userId: createdUser.userId,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        role: createdUser.role,
      }));
    });
  });

  describe('findAll', () => {
    it('should return an array of users as user response dtos', async () => {
      // Arrange
      const users = [
        {
          userId: 1,
          name: 'Test User 1',
          email: 'test1@example.com',
          phone: '+5511999999991',
          birthDate: '15-07-1990',
          password: 'hashedPassword1',
          tokenVersion: 1,
          role: Role.ADMIN,
        },
        {
          userId: 2,
          name: 'Test User 2',
          email: 'test2@example.com',
          phone: '+5511999999992',
          birthDate: '16-07-1990',
          password: 'hashedPassword2',
          tokenVersion: 2,
          role: Role.ADMIN,
        },
      ];

      mockUsersService.findAll.mockResolvedValue(users);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      result.forEach((user, index) => {
        expect(user.userId).toBe(users[index].userId);
        expect(user.name).toBe(users[index].name);
        expect(user.email).toBe(users[index].email);
        expect(user.phone).toBe(users[index].phone);
        expect(user.role).toBe(users[index].role);
      });
    });
  });

  describe('getProfile', () => {
    it('should return the current user profile as user response dto', async () => {
      // Arrange
      const req = {
        user: {
          userId: 1,
        },
      };
      
      const user = {
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        phone: '+5511999999999',
        birthDate: '15-07-1990',
        password: 'hashedPassword',
        tokenVersion: 1,
        role: Role.ADMIN,
      };

      mockUsersService.findById.mockResolvedValue(user);

      // Act
      const result = await controller.getProfile(req);

      // Assert
      expect(mockUsersService.findById).toHaveBeenCalledWith(req.user.userId);
      expect(result.userId).toBe(user.userId);
      expect(result.name).toBe(user.name);
      expect(result.email).toBe(user.email);
      expect(result.phone).toBe(user.phone);
      expect(result.role).toBe(user.role);
    });

    it('should throw an error if the user is not found', async () => {
      // Arrange
      const req = {
        user: {
          userId: 999,
        },
      };

      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      try {
        await controller.getProfile(req);
        // Se chegar aqui, falhou
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(`Usuário com ID ${req.user.userId} não encontrado.`);
      }
    });
  });

  describe('findOne', () => {
    it('should return a user by ID as user response dto', async () => {
      // Arrange
      const userId = 1;
      const user = {
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        phone: '+5511999999999',
        birthDate: '15-07-1990',
        password: 'hashedPassword',
        tokenVersion: 1,
        role: Role.ADMIN,
      };

      mockUsersService.findById.mockResolvedValue(user);

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(result.userId).toBe(user.userId);
      expect(result.name).toBe(user.name);
      expect(result.email).toBe(user.email);
      expect(result.phone).toBe(user.phone);
      expect(result.role).toBe(user.role);
    });

    it('should throw an error if the user is not found', async () => {
      // Arrange
      const userId = 999;
      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      try {
        await controller.findOne(userId);
        // Se chegar aqui, falhou
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(`Usuário com ID ${userId} não encontrado.`);
      }
    });
  });

  describe('update', () => {
    it('should update and return a user as user response dto', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };
      
      const updatedUser = {
        userId: 1,
        name: 'Updated Name',
        email: 'test@example.com',
        phone: '+5511999999999',
        birthDate: '15-07-1990',
        password: 'hashedPassword',
        tokenVersion: 1,
        role: Role.ADMIN,
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(userId, updateUserDto);

      // Assert
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result.userId).toBe(updatedUser.userId);
      expect(result.name).toBe(updatedUser.name);
      expect(result.email).toBe(updatedUser.email);
      expect(result.phone).toBe(updatedUser.phone);
      expect(result.role).toBe(updatedUser.role);
    });

    it('should convert birthDate string to Date object before updating', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        birthDate: '15-07-1990',
      };
      
      const updatedUser = {
        userId: 1,
        name: 'Updated Name',
        birthDate: '15-07-1990',
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      // Act
      await controller.update(userId, updateUserDto);

      // Assert
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        name: 'Updated Name',
        birthDate: expect.any(Date)
      }));
    });

    it('should handle other data types for birthDate correctly', async () => {
      // Arrange
      const userId = 1;
      const dateObj = new Date();
      const updateUserDto = {
        name: 'Updated Name',
        birthDate: dateObj as any,  // Use type assertion para evitar erros de tipo
      };
      
      const updatedUser = {
        userId: 1,
        name: 'Updated Name',
        birthDate: dateObj,
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      // Act
      await controller.update(userId, updateUserDto);

      // Assert
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        name: 'Updated Name',
        birthDate: dateObj
      }));
    });

    it('should pass undefined birthDate unchanged', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto = {
        name: 'Updated Name',
        birthDate: undefined,
      };
      
      const updatedUser = {
        userId: 1,
        name: 'Updated Name',
        birthDate: null,
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      // Act
      await controller.update(userId, updateUserDto);

      // Assert
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        name: 'Updated Name',
        birthDate: undefined
      }));
    });
  });

  describe('remove', () => {
    it('should call the service delete method', async () => {
      // Arrange
      const userId = 1;
      mockUsersService.delete.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(userId);

      // Assert
      expect(mockUsersService.delete).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from './../users/users.service';
import { User } from './../users/entities/users.entity';
import { Role } from './../common/enums/role.enum';
import { RegisterRequestDto } from './dto/request/register.request.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: Omit<User, 'password'> = {
    userId: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    birthDate: new Date('1990-01-01'),
    role: Role.CUSTOMER,
    tokenVersion: 1,
    hashPassword: jest.fn(),
    parseBirthDate: jest.fn(),
  };

  const mockUserWithPassword = {
    ...mockUser,
    password: 'hashedPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmailWithPassword: jest.fn(),
            findByEmail: jest.fn(),
            findByPhone: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            incrementTokenVersion: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup config service defaults
    configService.get.mockImplementation((key: string) => {
      const config = {
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_ACCESS_EXPIRATION_TIME: '15m',
        JWT_REFRESH_EXPIRATION_TIME: '7d',
      };
      return config[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const email = 'john@example.com';
      const password = 'password123';

      usersService.findByEmailWithPassword.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUserWithPassword.password);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.validateUser('invalid@example.com', 'password'))
        .rejects.toThrow(new UnauthorizedException('E-mail e/ou senha inválidos.'));
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('john@example.com', 'wrongpassword'))
        .rejects.toThrow(new UnauthorizedException('E-mail e/ou senha inválidos.'));
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      jwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await service.login(mockUser);

      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('register', () => {
    const registerDto: RegisterRequestDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      phone: '+9876543210',
      birthDate: '01-01-1995',
    };

    it('should register new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUserWithPassword);
      
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUserWithPassword);

      await expect(service.register(registerDto))
        .rejects.toThrow(new ConflictException(`Utilizador com o e-mail "${registerDto.email}" já existe.`));
    });

    it('should throw ConflictException when phone already exists', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(mockUserWithPassword);

      await expect(service.register(registerDto))
        .rejects.toThrow(new ConflictException(`Utilizador com o telefone "${registerDto.phone}" já existe.`));
    });
  });

  describe('logout', () => {
    it('should increment token version and return success message', async () => {
      const userId = 1;
      usersService.incrementTokenVersion.mockResolvedValue(undefined);

      const result = await service.logout(userId);

      expect(result.message).toBe('Todas as sessões foram encerradas com sucesso.');
      expect(usersService.incrementTokenVersion).toHaveBeenCalledWith(userId);
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens and increment version', async () => {
      const userWithNewVersion = { ...mockUserWithPassword, tokenVersion: 2 };
      
      usersService.findById.mockResolvedValue(userWithNewVersion);
      usersService.incrementTokenVersion.mockResolvedValue(undefined);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      const result = await service.refreshToken(mockUser as User);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(usersService.incrementTokenVersion).toHaveBeenCalledWith(mockUser.userId);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.refreshToken(mockUser as User))
        .rejects.toThrow(new UnauthorizedException('Usuário não encontrado.'));
    });
  });
});

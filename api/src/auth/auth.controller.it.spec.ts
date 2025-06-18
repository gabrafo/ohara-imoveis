import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from './../users/users.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { Role } from './../common/enums/role.enum';
import * as request from 'supertest';

describe('AuthController Integration', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;
  let configService: ConfigService;

  const mockUser = {
    userId: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    birthDate: new Date('1990-01-01'),
    role: Role.CUSTOMER,
    tokenVersion: 1,
    password: 'hashedPassword123',
    hashPassword: jest.fn(),
    parseBirthDate: jest.fn(),
  };

  const mockAuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  // Mock das configurações JWT para os testes
  const mockJwtConfig = {
    JWT_ACCESS_SECRET: 'test-access-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_ACCESS_EXPIRATION_TIME: '15m',
    JWT_REFRESH_EXPIRATION_TIME: '7d',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_ACCESS_SECRET') || mockJwtConfig.JWT_ACCESS_SECRET,
            signOptions: {
              expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION_TIME') || mockJwtConfig.JWT_ACCESS_EXPIRATION_TIME,
            },
          }),
          inject: [ConfigService],
        }),
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 10,
        }]),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: LocalStrategy,
          useFactory: (authService: AuthService) => {
            return new LocalStrategy(authService);
          },
          inject: [AuthService],
        },
        {
          provide: JwtStrategy,
          useFactory: (configService: ConfigService, usersService: UsersService) => {
            // Mock do ConfigService para garantir que as secrets existam
            const mockConfigService = {
              get: jest.fn((key: string) => {
                return mockJwtConfig[key] || configService.get(key);
              }),
            };
            return new JwtStrategy(usersService, mockConfigService as any);
          },
          inject: [ConfigService, UsersService],
        },
        {
          provide: JwtRefreshStrategy,
          useFactory: (configService: ConfigService, usersService: UsersService) => {
            // Mock do ConfigService para garantir que as secrets existam
            const mockConfigService = {
              get: jest.fn((key: string) => {
                return mockJwtConfig[key] || configService.get(key);
              }),
            };
            return new JwtRefreshStrategy(mockConfigService as any, usersService);
          },
          inject: [ConfigService, UsersService],
        },
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshToken: jest.fn(),
            validateUser: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            findByEmailWithPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    configService = module.get(ConfigService);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /auth/sign-up', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+9876543210',
        birthDate: '01-01-1995',
      };

      authService.register.mockResolvedValue(mockAuthResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(registerDto)
        .expect(201);

      expect(response.body).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('POST /auth/sign-in', () => {
    it('should authenticate user successfully', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue(mockAuthResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(mockAuthResponse);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully with valid token', async () => {
      const mockLogoutResponse = { message: 'Todas as sessões foram encerradas com sucesso.' };
      
      usersService.findById.mockResolvedValue(mockUser);
      authService.logout.mockResolvedValue(mockLogoutResponse);

      // Gerar um token válido usando a secret mockada
      const jwtService = app.get(JwtService);
      const token = await jwtService.signAsync(
        {
          sub: mockUser.userId,
          aud: 'access',
          version: mockUser.tokenVersion,
        },
        {
          secret: mockJwtConfig.JWT_ACCESS_SECRET,
        }
      );

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(mockLogoutResponse);
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should refresh tokens successfully', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      authService.refreshToken.mockResolvedValue(mockAuthResponse);

      // Gerar um refresh token válido usando a secret mockada
      const jwtService = app.get(JwtService);
      const refreshToken = await jwtService.signAsync(
        {
          sub: mockUser.userId,
          aud: 'refresh',
          version: mockUser.tokenVersion,
        },
        {
          secret: mockJwtConfig.JWT_REFRESH_SECRET,
          expiresIn: mockJwtConfig.JWT_REFRESH_EXPIRATION_TIME,
        }
      );

      const response = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(response.body).toEqual(mockAuthResponse);
    });
  });
});
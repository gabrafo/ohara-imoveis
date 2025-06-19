import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { JwtRefreshStrategy } from '../strategies/jwt-refresh.strategy';
import { UsersService } from '../../users/users.service';
import { Role } from '../../common/enums/role.enum';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    userId: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    birthDate: new Date('1990-01-01'),
    role: Role.CUSTOMER,
    tokenVersion: 1,
    password: 'hashedPassword',
    hashPassword: jest.fn(),
    parseBirthDate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('refresh-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
    usersService = module.get(UsersService);
  });

  describe('validate', () => {
    const mockRequest = {} as Request;
    const payload = {
      sub: 1,
      exp: Date.now() + 604800000, // 7 days
      aud: 'refresh',
      version: 1,
    };

    it('should return user data when refresh token is valid', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockRequest, payload);

      expect(result).toEqual({
        ...mockUser,
        exp: payload.exp,
        version: payload.version,
        aud: payload.aud,
      });
    });

    it('should throw ForbiddenException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(strategy.validate(mockRequest, payload))
        .rejects.toThrow(new ForbiddenException('Acesso negado.'));
    });

    it('should throw UnauthorizedException when token version mismatch', async () => {
      const userWithDifferentVersion = { ...mockUser, tokenVersion: 2 };
      usersService.findById.mockResolvedValue(userWithDifferentVersion);

      await expect(strategy.validate(mockRequest, payload))
        .rejects.toThrow(new UnauthorizedException('Sessão expirada.'));
    });

    it('should throw UnauthorizedException when audience is not refresh', async () => {
      const invalidPayload = { ...payload, aud: 'access' };
      usersService.findById.mockResolvedValue(mockUser);

      await expect(strategy.validate(mockRequest, invalidPayload))
        .rejects.toThrow(new UnauthorizedException('Token inválido.'));
    });
  });
});
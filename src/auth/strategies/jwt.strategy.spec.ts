import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { LocalStrategy } from '../strategies/local.strategy';
import { AuthService } from '../auth.service';
import { Role } from '../../common/enums/role.enum';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      const email = 'john@example.com';
      const password = 'password123';

      authService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(email, password);

      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith(email, password);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      authService.validateUser.mockResolvedValue(null as any);

      await expect(strategy.validate('invalid@example.com', 'wrongpassword'))
        .rejects.toThrow(new UnauthorizedException('Credenciais inválidas.'));
    });
  });
});
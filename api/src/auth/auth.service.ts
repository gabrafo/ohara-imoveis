import { ConflictException, Inject, Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/users.entity';

import { RegisterRequestDto } from './dto/request/register.request.dto';
import { AuthResponseDto } from './dto/response/auth.response.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('E-mail e/ou senha inválidos.');
    }
    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('E-mail e/ou senha inválidos.');
    }
    const { password, ...rest } = user;
    const result: Omit<User, 'password'> = { ...rest } as Omit<User, 'password'>;
    return result;
  }

  private async getTokens(user: Omit<User, 'password'>): Promise<{ accessToken: string; refreshToken: string }> {
    const accessTokenPayload = { sub: user.userId, role: user.role, aud: 'access', version: user.tokenVersion };
    const refreshTokenPayload = { sub: user.userId, aud: 'refresh', version: user.tokenVersion };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(userId: number): Promise<{ message: string }> {
    await this.usersService.incrementTokenVersion(userId);
    return { message: 'Todas as sessões foram encerradas com sucesso.' };
  }

  async login(user: Omit<User, 'password'>): Promise<AuthResponseDto> {
    const { accessToken, refreshToken } = await this.getTokens(user);
    return new AuthResponseDto(accessToken, refreshToken);
  }

  async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(`Utilizador com o e-mail "${dto.email}" já existe.`);
    }

    const existingPhoneUser = await this.usersService.findByPhone(dto.phone);

    if (existingPhoneUser) {
      throw new ConflictException(`Utilizador com o telefone "${dto.phone}" já existe.`);
    }
    
    const newUser = await this.usersService.create(dto);
    return this.login(newUser);
  }

  async refreshToken(user: User): Promise<AuthResponseDto> {

    const userWithNewVersion = await this.usersService.findById(user.userId);

    if (!userWithNewVersion) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    const { accessToken, refreshToken } = await this.getTokens(userWithNewVersion);

    await this.usersService.incrementTokenVersion(user.userId);
    
    return new AuthResponseDto(accessToken, refreshToken);
  }
}
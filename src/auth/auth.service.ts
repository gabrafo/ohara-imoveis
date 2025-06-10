import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async createToken(user: User) {
    return this.jwtService.sign({
        role: user.role
      }, {
        secret: process.env.SECRET_KEY,
        expiresIn: '1h',
        subject: String(user.userId),
        issuer: 'ohara-imoveis',
        audience: 'users'
      });
  }

  async checkToken() {

  }

  async login(dto: LoginRequestDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email }
    });

    if (!user) {
      throw new UnauthorizedException('E-mail e/ou senha inválidos.');
    }

    const isPasswordMatching = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('E-mail e/ou senha inválidos.');
    }

    return new LoginResponseDto(await this.createToken(user));
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new ConflictException('Usuário não encontrado.');
    }

    // TODO: Enviar e-mail com instruções de redefinição de senha

    return 'E-mail de redefinição de senha enviado com sucesso.';
  }

  /*async resetPassword(token: string, newPassword: string) {
    // TODO: Verificar o token e redefinir a senha do usuário

    const user = await this.userRepository.findOne({ where: { userId: token.userId } });
    if (!user) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }*/

  async register(dto: RegisterRequestDto){
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });

    if (existingUser) {
      throw new ConflictException(`Usuário com o e-mail "${dto.email}" já existe.`);
    }

    const user = await this.userRepository.save(this.userRepository.create(dto));

    return new LoginResponseDto((await this.createToken(user)));
  }
}

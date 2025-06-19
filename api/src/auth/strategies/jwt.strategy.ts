import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {
    const jwtSecret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: number; jti: string; exp: number; aud: string, version: number }): Promise<any> {
    
    const user = await this.usersService.findById(payload.sub);

    if (!user || payload.aud !== 'access') {
      throw new UnauthorizedException('Token inválido.');
    }

    if (user.tokenVersion !== payload.version) {
      throw new UnauthorizedException('Sessão expirada.');
    }

    const { password, ...result } = user;
    return { ...result, exp: payload.exp, version: payload.version, aud: payload.aud };
  }
}
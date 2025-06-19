import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, ForbiddenException, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    } as import('passport-jwt').StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: any) {

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new ForbiddenException('Acesso negado.');
    }

    if (user.tokenVersion !== payload.version) {
      throw new UnauthorizedException('Sessão expirada.');
    }

    if (payload.aud !== 'refresh') {
      throw new UnauthorizedException('Token inválido.');
    }

    return { ...user, exp: payload.exp, version: payload.version, aud: payload.aud };
  }
}

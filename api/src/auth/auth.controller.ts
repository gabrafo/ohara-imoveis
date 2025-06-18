import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { AuthResponseDto } from './dto/response/auth.response.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { LoginRequestDto } from './dto/request/login.request.dto';

@ApiTags('Autenticação')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Cadastra um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Conflito. O e-mail ou telefone já está em uso.' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('sign-up')
  async signUp(@Body() registerDto: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Autentica um usuário e obtém os tokens' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido.', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Request() req: any): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Encerra todas as sessões ativas do usuário' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Todas as sessões foram encerradas.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req: any): Promise<{ message: string }> {
    return this.authService.logout(req.user.userId);
  }

  @ApiOperation({ summary: 'Atualiza o token de acesso usando um refresh token' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Tokens atualizados com sucesso.', type: AuthResponseDto })
  @ApiResponse({ status: 403, description: 'Acesso negado. O refresh token é inválido ou foi revogado.' })
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refresh(@Request() req: any): Promise<AuthResponseDto> {
    return this.authService.refreshToken(req.user);
  }
}
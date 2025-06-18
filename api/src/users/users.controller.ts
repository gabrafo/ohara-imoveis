import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/request/update-user.request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles, RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResourceOwnerGuard, SkipResourceOwnerCheck } from 'src/auth/guards/resource-owner.guard';
import { CreateUserDto } from './dto/request/create-user.request.dto';
import { UserResponseDto } from './dto/response/user.response.dto';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  @SkipResourceOwnerCheck()
  @ApiOperation({
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário no sistema. Apenas administradores podem executar esta ação.'
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso.',
    type: UserResponseDto
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos fornecidos.' })
  @ApiUnauthorizedResponse({ description: 'Token de acesso inválido ou expirado.' })
  @ApiForbiddenResponse({ description: 'Apenas administradores podem criar usuários.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    const { password, tokenVersion, ...result } = user;
    return result;
  }

  @Get()
  @Roles('ADMIN')
  @SkipResourceOwnerCheck()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna uma lista com todos os usuários cadastrados. Apenas administradores podem executar esta ação.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
    type: [UserResponseDto]
  })
  @ApiUnauthorizedResponse({ description: 'Token de acesso inválido ou expirado.' })
  @ApiForbiddenResponse({ description: 'Apenas administradores podem listar todos os usuários.' })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map(user => {
      const { password, tokenVersion, ...result } = user;
      return result;
    });
  }

  @Get('profile')
  @Roles('CUSTOMER', 'BROKER', 'ADMIN')
  @SkipResourceOwnerCheck()
  @ApiOperation({
    summary: 'Obter perfil do usuário logado',
    description: 'Retorna os dados do usuário atualmente logado.'
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso.',
    type: UserResponseDto
  })
  @ApiUnauthorizedResponse({ description: 'Token de acesso inválido ou expirado.' })
  async getProfile(@Request() req): Promise<UserResponseDto> {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new Error(`Usuário com ID ${req.user.userId} não encontrado.`);
    }
    const { password, tokenVersion, ...result } = user;
    return result;
  }

  @Get(':userId')
  @Roles('CUSTOMER', 'BROKER', 'ADMIN')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Busca um usuário específico pelo ID. Usuários só podem acessar seus próprios dados, exceto administradores.'
  })
  @ApiParam({ name: 'userId', description: 'ID único do usuário', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso.',
    type: UserResponseDto
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token de acesso inválido ou expirado.' })
  @ApiForbiddenResponse({ description: 'Você não tem permissão para acessar este recurso.' })
  async findOne(@Param('userId', ParseIntPipe) userId: number): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado.`);
    }
    const { password, tokenVersion, ...result } = user;
    return result;
  }

  @Patch(':userId')
  @Roles('CUSTOMER', 'BROKER', 'ADMIN')
  @ApiOperation({
    summary: 'Atualizar dados do usuário',
    description: 'Atualiza os dados de um usuário. Usuários só podem atualizar seus próprios dados, exceto administradores.'
  })
  @ApiParam({ name: 'userId', description: 'ID único do usuário', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
    type: UserResponseDto
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  @ApiBadRequestResponse({ description: 'Dados inválidos fornecidos.' })
  @ApiUnauthorizedResponse({ description: 'Token de acesso inválido ou expirado.' })
  @ApiForbiddenResponse({ description: 'Você não tem permissão para acessar este recurso.' })
  async update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const dto = { ...updateUserDto } as any;
    if (dto.birthDate && typeof dto.birthDate === 'string') {
      dto.birthDate = new Date(dto.birthDate);
    }
    const user = await this.usersService.update(userId, dto);
    const { password, tokenVersion, ...result } = user;
    return result;
  }

  @Delete(':userId')
  @Roles('CUSTOMER', 'BROKER', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar conta do usuário',
    description: 'Remove a conta do usuário do sistema. Usuários só podem deletar suas próprias contas, exceto administradores.'
  })
  @ApiParam({ name: 'userId', description: 'ID único do usuário', example: 1 })
  @ApiResponse({
    status: 204,
    description: 'Conta deletada com sucesso.'
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token de acesso inválido ou expirado.' })
  @ApiForbiddenResponse({ description: 'Você não tem permissão para acessar este recurso.' })
  async remove(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    await this.usersService.delete(userId);
  }
}
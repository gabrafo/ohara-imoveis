import { Controller, Post, Body, Get, Param, Put, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CreateOwnerDto } from './dto/request/create-owner.dto';
import { UpdateOwnerDto } from './dto/request/update-owner.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Owner } from './entities/owner.entity';
import { ResourceOwnerGuard, SkipResourceOwnerCheck } from 'src/auth/guards/resource-owner.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles, RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Proprietários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
@Controller('owners')
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo proprietário' })
  @ApiResponse({ status: 201, description: 'Proprietário criado com sucesso', type: Owner })
  @Roles('ADMIN', 'BROKER')
  @SkipResourceOwnerCheck()
  @ApiBody({ type: CreateOwnerDto })
  async create(@Body() createOwnerDto: CreateOwnerDto): Promise<Owner> {
    return this.ownersService.createOwner(createOwnerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os proprietários' })
  @ApiResponse({ status: 200, description: 'Lista de proprietários', type: [Owner] })
  @Roles('ADMIN', 'BROKER')
  @SkipResourceOwnerCheck()
  async findAll(): Promise<Owner[]> {
    return this.ownersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um proprietário pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do proprietário' })
  @ApiResponse({ status: 200, description: 'Proprietário encontrado', type: Owner })
  @ApiResponse({ status: 404, description: 'Proprietário não encontrado' })
  @Roles('ADMIN', 'BROKER')
  @SkipResourceOwnerCheck()
  async findOne(@Param('id') id: number): Promise<Owner> {
    return this.ownersService.findOne(id);
  }

  @Get('cpf/:cpf')
  @ApiOperation({ summary: 'Busca um proprietário pelo CPF' })
  @ApiParam({ name: 'cpf', type: String, description: 'CPF do proprietário' })
  @ApiResponse({ status: 200, description: 'Proprietário encontrado', type: Owner })
  @ApiResponse({ status: 404, description: 'Proprietário não encontrado' })
  @Roles('ADMIN', 'BROKER')
  @SkipResourceOwnerCheck()
  async findByCpf(@Param('cpf') cpf: string): Promise<Owner> {
    return this.ownersService.findByCpf(cpf);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um proprietário pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do proprietário' })
  @ApiBody({ type: UpdateOwnerDto })
  @ApiResponse({ status: 200, description: 'Proprietário atualizado', type: Owner })
  @ApiResponse({ status: 404, description: 'Proprietário não encontrado' })
  @Roles('ADMIN', 'BROKER')
  @SkipResourceOwnerCheck()
  async update(@Param('id') id: number, @Body() updateOwnerDto: UpdateOwnerDto): Promise<Owner> {
    return this.ownersService.update(id, updateOwnerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um proprietário pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do proprietário' })
  @ApiResponse({ status: 204, description: 'Proprietário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Proprietário não encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN', 'BROKER')
  @SkipResourceOwnerCheck()
  async delete(@Param('id') id: number): Promise<void> {
    return this.ownersService.delete(id);
  }
}
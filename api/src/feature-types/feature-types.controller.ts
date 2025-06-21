import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FeatureTypesService } from './feature-types.service';
import { CreateFeatureTypeDto } from './dto/request/create-feature-type.dto';
import { UpdateFeatureTypeDto } from './dto/request/update-feature-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FeatureTypeResponseDto } from './dto/response/feature-type.response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles, RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Tipos de características')
@Controller('feature-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeatureTypesController {
  constructor(private readonly featureTypesService: FeatureTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo tipo de característica' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de característica criado com sucesso',
    type: FeatureTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @Roles('ADMIN')
  async create(@Body() createFeatureTypeDto: CreateFeatureTypeDto): Promise<FeatureTypeResponseDto> {
    const featureType = await this.featureTypesService.create(createFeatureTypeDto);
    return new FeatureTypeResponseDto(featureType);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tipos de características' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de características retornada com sucesso',
    type: [FeatureTypeResponseDto],
  })
  @Roles('ADMIN')
  async findAll(): Promise<FeatureTypeResponseDto[]> {
    const featureTypes = await this.featureTypesService.findAll();
    return featureTypes.map(featureType => new FeatureTypeResponseDto(featureType));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um tipo de característica pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do tipo de característica' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de característica encontrado',
    type: FeatureTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tipo de característica não encontrado' })
  @Roles('ADMIN')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<FeatureTypeResponseDto> {
    const featureType = await this.featureTypesService.findOne(id);
    return new FeatureTypeResponseDto(featureType);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um tipo de característica' })
  @ApiParam({ name: 'id', description: 'ID do tipo de característica' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de característica atualizado com sucesso',
    type: FeatureTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tipo de característica não encontrado' })
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeatureTypeDto: UpdateFeatureTypeDto,
  ): Promise<FeatureTypeResponseDto> {
    const featureType = await this.featureTypesService.update(id, updateFeatureTypeDto);
    return new FeatureTypeResponseDto(featureType);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um tipo de característica' })
  @ApiParam({ name: 'id', description: 'ID do tipo de característica' })
  @ApiResponse({ status: 204, description: 'Tipo de característica removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Tipo de característica não encontrado' })
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.featureTypesService.remove(id);
  }
}

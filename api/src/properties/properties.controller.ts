import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyRequestDto } from './dto/request/create-property.request.dto';
import { UpdatePropertyRequestDto } from './dto/request/update-property.request.dto';
import { FilterPropertyRequestDto } from './dto/request/filter-property.request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyResponseDto } from './dto/response/property.response.dto';
import { PropertyListResponseDto } from './dto/response/property-list.response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.guard';

@ApiTags('Propriedades')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova propriedade' })
  @ApiResponse({
    status: 201,
    description: 'Propriedade criada com sucesso',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BROKER')
  @ApiBearerAuth()
  async create(@Body() createPropertyDto: CreatePropertyRequestDto): Promise<PropertyResponseDto> {
    const property = await this.propertiesService.createProperty(createPropertyDto);
    return new PropertyResponseDto(property);
  }

  @Get()
  @ApiOperation({ summary: 'Listar propriedades com filtros opcionais' })
  @ApiResponse({
    status: 200,
    description: 'Lista de propriedades retornada com sucesso',
    type: [PropertyListResponseDto],
  })
  async findAll(@Query() filters: FilterPropertyRequestDto): Promise<PropertyListResponseDto[]> {
    const properties = await this.propertiesService.findAll(filters);
    return properties.map(property => new PropertyListResponseDto(property));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma propriedade pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da propriedade' })
  @ApiResponse({
    status: 200,
    description: 'Propriedade encontrada',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Propriedade não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PropertyResponseDto> {
    const property = await this.propertiesService.findOne(id);
    return new PropertyResponseDto(property);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma propriedade' })
  @ApiParam({ name: 'id', description: 'ID da propriedade' })
  @ApiResponse({
    status: 200,
    description: 'Propriedade atualizada com sucesso',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Propriedade não encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BROKER')
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyRequestDto,
  ): Promise<PropertyResponseDto> {
    const property = await this.propertiesService.update(id, updatePropertyDto);
    return new PropertyResponseDto(property);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma propriedade' })
  @ApiParam({ name: 'id', description: 'ID da propriedade' })
  @ApiResponse({ status: 204, description: 'Propriedade removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Propriedade não encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BROKER')
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.propertiesService.remove(id);
  }
}

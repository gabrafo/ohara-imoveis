import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PropertyFeaturesService } from './property-features.service';
import { CreatePropertyFeatureDto } from './dto/request/create-property-feature.dto';
import { UpdatePropertyFeatureDto } from './dto/request/update-property-feature.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyFeatureResponseDto } from './dto/response/property-feature.response.dto';
import { Roles, RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Características da propriedade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('property-features')
export class PropertyFeaturesController {
  constructor(
    private readonly propertyFeaturesService: PropertyFeaturesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova característica para uma propriedade' })
  @ApiResponse({
    status: 201,
    description: 'Característica da propriedade criada com sucesso',
    type: PropertyFeatureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou tipo de característica não permite quantidade' })
  @ApiResponse({ status: 404, description: 'Propriedade ou tipo de característica não encontrado' })
  @Roles('ADMIN', 'BROKER')
  async create(@Body() createPropertyFeatureDto: CreatePropertyFeatureDto): Promise<PropertyFeatureResponseDto> {
    const propertyFeature = await this.propertyFeaturesService.create(createPropertyFeatureDto);
    return new PropertyFeatureResponseDto(propertyFeature);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as características de uma propriedade' })
  @ApiQuery({ name: 'propertyId', description: 'ID da propriedade', required: true })
  @ApiResponse({
    status: 200,
    description: 'Lista de características da propriedade retornada com sucesso',
    type: [PropertyFeatureResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Propriedade não encontrada' })
  @Roles('ADMIN', 'BROKER')
  async findAll(@Query('propertyId', ParseIntPipe) propertyId: number): Promise<PropertyFeatureResponseDto[]> {
    const propertyFeatures = await this.propertyFeaturesService.findAllByPropertyId(propertyId);
    return propertyFeatures.map(feature => new PropertyFeatureResponseDto(feature));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma característica de propriedade pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da característica da propriedade' })
  @ApiResponse({
    status: 200,
    description: 'Característica da propriedade encontrada',
    type: PropertyFeatureResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Característica da propriedade não encontrada' })
  @Roles('ADMIN', 'BROKER')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PropertyFeatureResponseDto> {
    const propertyFeature = await this.propertyFeaturesService.findOne(id);
    return new PropertyFeatureResponseDto(propertyFeature);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma característica de propriedade' })
  @ApiParam({ name: 'id', description: 'ID da característica da propriedade' })
  @ApiResponse({
    status: 200,
    description: 'Característica da propriedade atualizada com sucesso',
    type: PropertyFeatureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou tipo de característica não permite quantidade' })
  @ApiResponse({ status: 404, description: 'Característica da propriedade não encontrada' })
  @Roles('ADMIN', 'BROKER')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyFeatureDto: UpdatePropertyFeatureDto,
  ): Promise<PropertyFeatureResponseDto> {
    const propertyFeature = await this.propertyFeaturesService.update(id, updatePropertyFeatureDto);
    return new PropertyFeatureResponseDto(propertyFeature);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma característica de propriedade' })
  @ApiParam({ name: 'id', description: 'ID da característica da propriedade' })
  @ApiResponse({ status: 204, description: 'Característica da propriedade removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Característica da propriedade não encontrada' })
  @Roles('ADMIN', 'BROKER')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.propertyFeaturesService.remove(id);
  }
}

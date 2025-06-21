// src/property-images/property-images.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  ParseIntPipe,
  UseGuards,
  BadRequestException,
  Patch,
  Body,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { PropertyImagesService } from './property-images.service';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ImageUploadDto } from './dto/image-upload.dto';
import { PropertyImage } from './entities/property-image.entity';

@ApiTags('Imagens de Propriedades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('properties')
export class PropertyImagesController {
  constructor(private readonly propertyImagesService: PropertyImagesService) {}

  @Post(':propertyId/images')
  @Roles('ADMIN', 'BROKER')
  @ApiOperation({ summary: 'Upload de uma nova imagem para uma propriedade' })
  @ApiParam({ name: 'propertyId', description: 'ID da propriedade', type: 'number' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ 
    description: 'Upload de imagem com metadados opcionais',
    type: ImageUploadDto 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Imagem enviada com sucesso',
    type: PropertyImage
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('isMain') isMain?: string,
    @Body('description') description?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo de imagem não fornecido');
    }

    const isMainBool = isMain === 'true';
    
    return this.propertyImagesService.uploadImage(
      propertyId,
      file,
      isMainBool,
      description
    );
  }

  @Get(':propertyId/images')
  @ApiOperation({ summary: 'Lista todas as imagens de uma propriedade' })
  @ApiParam({ name: 'propertyId', description: 'ID da propriedade', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de imagens da propriedade',
    type: [PropertyImage]
  })
  async getPropertyImages(@Param('propertyId', ParseIntPipe) propertyId: number) {
    return this.propertyImagesService.findByPropertyId(propertyId);
  }

  @Get(':propertyId/images/main')
  @ApiOperation({ summary: 'Obtém a imagem principal de uma propriedade' })
  @ApiParam({ name: 'propertyId', description: 'ID da propriedade', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Imagem principal da propriedade',
    type: PropertyImage
  })
  async getMainImage(@Param('propertyId', ParseIntPipe) propertyId: number) {
    return this.propertyImagesService.findMainImageByPropertyId(propertyId);
  }

  @Patch(':propertyId/images/:imageId/main')
  @Roles('ADMIN', 'BROKER')
  @ApiOperation({ summary: 'Define uma imagem como principal para a propriedade' })
  @ApiParam({ name: 'propertyId', description: 'ID da propriedade', type: 'number' })
  @ApiParam({ name: 'imageId', description: 'ID da imagem', type: 'number' })
  @ApiResponse({ status: 200, description: 'Imagem definida como principal' })
  @HttpCode(HttpStatus.OK)
  async setMainImage(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    await this.propertyImagesService.setMainImage(imageId, propertyId);
    return { message: 'Imagem definida como principal com sucesso' };
  }

  @Delete(':propertyId/images/:imageId')
  @Roles('ADMIN', 'BROKER')
  @ApiOperation({ summary: 'Remove uma imagem da propriedade' })
  @ApiParam({ name: 'propertyId', description: 'ID da propriedade', type: 'number' })
  @ApiParam({ name: 'imageId', description: 'ID da imagem', type: 'number' })
  @ApiResponse({ status: 204, description: 'Imagem removida com sucesso' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Param('imageId', ParseIntPipe) imageId: number
  ) {
    await this.propertyImagesService.deleteImage(imageId, propertyId);
  }
}
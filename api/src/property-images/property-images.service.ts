import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PropertyImage } from './entities/property-image.entity';
import * as fs from 'fs';

@Injectable()
export class PropertyImagesService {
  constructor(
    @InjectRepository(PropertyImage)
    private readonly propertyImageRepository: Repository<PropertyImage>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async uploadImage(
    propertyId: number, 
    file: Express.Multer.File,
    isMain: boolean = false,
    description?: string
  ): Promise<PropertyImage> {
    const imageCount = await this.propertyImageRepository.count({
      where: { property: { propertyId } },
    });

    // Limite de 20 imagens por propriedade
    if (imageCount >= 20) {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(`Erro ao excluir arquivo após limite excedido: ${error.message}`);
      }
      throw new BadRequestException('Limite de imagens excedido. Máximo de 20 imagens por propriedade.');
    }

    return this.dataSource.transaction(async (manager) => {
      // Se for imagem principal, desmarcar a atual como principal
      if (isMain) {
        await manager.update(
          PropertyImage,
          { property: { propertyId }, isMain: true },
          { isMain: false }
        );
      }

      // Se for primeira imagem, torná-la principal automaticamente
      if (imageCount === 0) {
        isMain = true;
      }

      const image = manager.create(PropertyImage, {
        filename: file.filename,
        path: file.path,
        isMain,
        description,
        property: { propertyId },
      });

      return manager.save(image);
    });
  }

  async findByPropertyId(propertyId: number): Promise<PropertyImage[]> {
    return this.propertyImageRepository.find({
      where: { property: { propertyId } },
      order: { isMain: 'DESC', uploadedAt: 'ASC' }
    });
  }

  async findMainImageByPropertyId(propertyId: number): Promise<PropertyImage | null> {
    return this.propertyImageRepository.findOne({
      where: { property: { propertyId }, isMain: true }
    });
  }

  async setMainImage(imageId: number, propertyId: number): Promise<void> {
    const image = await this.propertyImageRepository.findOne({
      where: { imageId, property: { propertyId } }
    });

    if (!image) {
      throw new NotFoundException(`Imagem com ID ${imageId} não encontrada para a propriedade ${propertyId}`);
    }

    await this.dataSource.transaction(async (manager) => {
      // Desmarcar a imagem principal atual
      await manager.update(
        PropertyImage,
        { property: { propertyId }, isMain: true },
        { isMain: false }
      );

      // Marcar a nova imagem como principal
      await manager.update(
        PropertyImage,
        { imageId },
        { isMain: true }
      );
    });
  }

  async deleteImage(imageId: number, propertyId: number): Promise<void> {
    const image = await this.propertyImageRepository.findOne({
      where: { imageId, property: { propertyId } },
      relations: ['property']
    });
    
    if (!image) {
      throw new NotFoundException(`Imagem com ID ${imageId} não encontrada para a propriedade ${propertyId}`);
    }
    
    try {
      fs.unlinkSync(image.path);
    } catch (error) {
      console.error(`Erro ao excluir arquivo: ${error.message}`);
    }
    
    await this.propertyImageRepository.remove(image);
    
    if (image.isMain) {
      const nextImage = await this.propertyImageRepository.findOne({
        where: { property: { propertyId: image.property.propertyId } },
        order: { uploadedAt: 'ASC' }
      });
      
      if (nextImage) {
        await this.setMainImage(nextImage.imageId, image.property.propertyId);
      }
    }
  }
}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyImagesController } from './property-images.controller';
import { PropertyImagesService } from './property-images.service';
import { PropertyImage } from './entities/property-image.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [PropertyImage]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Cria diretório de uploads se não existir
          const uploadPath = './uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Gera um nome de arquivo único usando UUID
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Aceitar apenas imagens
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Apenas imagens são permitidas'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB
      },
    }),
  ],
  controllers: [PropertyImagesController],
  providers: [
    PropertyImagesService
  ]
})
export class PropertyImagesModule {}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('HTTP');

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos não declarados nos DTOs
      forbidNonWhitelisted: true, // Rejeita requisições com campos extras
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Converte tipos de forma mais ampla
      },
    })
  );

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,PUT,POST,DELETE',
    credentials: true,
  });

  app.use((req, res, next) => {
    res.on('finish', () => {
      logger.log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
    });
    next();
  });

  const config = new DocumentBuilder()
  .setTitle('API do Projeto')
  .setDescription('Documentação da API do sistema Ohara Imóveis')
  .setVersion('1.0')
  .addTag('ohara-imoveis')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
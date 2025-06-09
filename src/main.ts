import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from '@nestjs/common';

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
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
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
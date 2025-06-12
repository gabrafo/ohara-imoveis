import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 8000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(helmet());

  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin.split(','),
      methods: 'GET,PUT,POST,DELETE,PATCH',
      credentials: true,
    });
    logger.log(`CORS habilitado para a(s) origem(ns): ${corsOrigin}`);
  }

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
      if (res.statusCode >= 400) {
        logger.warn(logMessage);
      } else {
        logger.log(logMessage);
      }
    });
    next();
  });

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Ohara Imóveis API')
      .setDescription('Documentação da API do sistema Ohara Imóveis')
      .setVersion('1.0')
      .addTag('ohara-imoveis')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.log(`Documentação Swagger disponível em /api`);
  }
  
  // --- INICIALIZAÇÃO ---
  await app.listen(port);
  logger.log(`Aplicação rodando na porta: ${port}`);
}

bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { AppLogger } from './modules/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
  const logger = new AppLogger();
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.use(json({ limit: '10mb' }));

  const config = app.get(ConfigService);

  app.enableCors({
    origin: '*', // Adjust this as needed for security
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  try {
    await app.listen(config.get('app.port') ?? 3000);
    logger.log(`Server started successfully! on PORT ${config.get('app.port')}`, 'Bootstrap');
  } catch (error) {
    logger.error('Server failed to start', error, 'Bootstrap');
    throw error;
  }
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new AppLogger();
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*', // Adjust this as needed for security
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  //  set up global pipes, filters, or interceptors here
  // e.g., app.useGlobalPipes(new ValidationPipe());
  // Start the application
  try {
    await app.listen(config.get('app.port') ?? 3000);
    logger.log(
      `Server started successfully! on PORT ${config.get('app.port')}`,
      'Bootstrap',
    );
  } catch (error) {
    logger.error('Server failed to start', error, 'Bootstrap');
    throw error;
  }
}

bootstrap();

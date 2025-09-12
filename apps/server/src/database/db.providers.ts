import { DataSource } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { AppLogger } from 'src/logger/logger.service';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [AppLogger, ConfigService, ModuleRef],
    useFactory: async (logger: AppLogger, config: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
      });

      try {
        await dataSource.initialize();
        logger.log('Database connected successfully!', 'DATA SOURCE');
      } catch (error) {
        logger.error('Database connection failed', error, 'DataSource');
        throw error;
      }

      return dataSource;
    },
  },
];

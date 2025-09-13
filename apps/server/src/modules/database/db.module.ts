import { Module } from '@nestjs/common';
import { databaseProviders } from './db.providers';
import { LoggerModule } from 'src/modules/logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [LoggerModule, ConfigModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { databaseProviders } from './db.providers';
import { LoggerModule } from 'src/modules/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

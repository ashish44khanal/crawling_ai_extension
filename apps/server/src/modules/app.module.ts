import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/db.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from '../config/env.validation';
import { RagModule } from './rag/rag.module';
import appConfig from '../config/app.config';
import databaseConfig from '../config/database.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
      validate,
      load: [appConfig, databaseConfig],
    }),
    DatabaseModule,
    RagModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

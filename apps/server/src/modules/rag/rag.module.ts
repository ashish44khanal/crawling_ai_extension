import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingsEntity } from './entities/embeddings.entity';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmbeddingsEntity]), LoggerModule],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}

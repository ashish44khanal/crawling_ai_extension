import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingsEntity } from './entities/embeddings.entity';
import { LoggerModule } from '../logger/logger.module';
import { ExtractedOutputEntity } from './entities/extracted_output.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmbeddingsEntity, ExtractedOutputEntity]), LoggerModule],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}

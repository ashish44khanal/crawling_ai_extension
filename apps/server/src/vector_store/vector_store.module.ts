import { Module } from '@nestjs/common';
import { VectorStoreService } from './vector_store.service';

@Module({
  providers: [VectorStoreService],
  exports: [VectorStoreService],
})
export class VectorStoreModule {}

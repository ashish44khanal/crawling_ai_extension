import { Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}
  @Post('ingest')
  async ingest() {
    return this.ragService.ingest();
  }
}

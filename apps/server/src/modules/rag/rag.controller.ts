import { Body, Controller, Get, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { CreateRagDto } from './dto/create_rag.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}
  @Post('ingest')
  async ingest(@Body() createRagDto: CreateRagDto) {
    return await this.ragService.extractTextFromHtml(createRagDto);
  }
}

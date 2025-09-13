import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { CreateRagDto } from './dto/create_rag.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}
  @Post('ingest')
  ingest(@Body() createRagDto: CreateRagDto) {
    console.log('Received body:', createRagDto); // Debugging line
    return this.ragService.ingest(createRagDto);
  }
}

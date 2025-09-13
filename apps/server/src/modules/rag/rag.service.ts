import { Injectable } from '@nestjs/common';
import { CreateRagDto } from './dto/create_rag.dto';

@Injectable()
export class RagService {
  constructor() {}
  ingest(payload: CreateRagDto) {
    return { reply: payload.html, url: payload.url, instruction: payload.instruction };
  }
}

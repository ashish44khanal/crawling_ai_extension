import { Injectable } from '@nestjs/common';

@Injectable()
export class RagService {
  constructor() {}
  async ingest() {
    return new Promise(() => {
      message: 'Ingestion started';
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { AppLogger } from 'src/modules/logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VectorStoreService {
  private readonly logger = new AppLogger('VectorStoreService');
  private vectorStore: PGVectorStore;
  private configService: ConfigService;
  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
    private readonly tableName: string,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing VectorStoreService...');

    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      this.logger.log('DataSource initialized.');
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: this.configService.get<string>('app.openAIApiKey'),
      // model: 'text-embedding-ada-002', TODO:
    });

    this.vectorStore = await PGVectorStore.initialize(embeddings, {
      postgresConnectionOptions: this.dataSource.options,
      tableName: this.tableName,
    });
    this.logger.log('PGVectorStore initialized.');
  }

  async addDocuments(documents: Document[]): Promise<void> {
    this.logger.log(`Adding ${documents.length} documents to vector store.`);
    await this.vectorStore.addDocuments(documents);
    this.logger.log('Documents added successfully.');
  }

  async similaritySearch(query: string, k = 5): Promise<Document[]> {
    this.logger.log(`Performing similarity search for query: "${query}".`);
    return this.vectorStore.similaritySearch(query, k);
  }
}

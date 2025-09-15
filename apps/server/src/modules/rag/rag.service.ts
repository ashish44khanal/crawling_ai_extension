import { Injectable } from '@nestjs/common';
import { CreateRagDto } from './dto/create_rag.dto';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { EmbeddingsEntity } from './entities/embeddings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppLogger } from '../logger/logger.service';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { domAwareSplit } from './utils/domBadedChunk';

@Injectable()
export class RagService {
  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;
  private pgVector: PGVectorStore;

  constructor(
    private configService: ConfigService,
    @InjectRepository(EmbeddingsEntity) private embeddingsRepository: Repository<EmbeddingsEntity>,
    private logger: AppLogger
  ) {
    this.llm = new ChatOpenAI({
      temperature: 0,
      model: 'gpt-4',
      apiKey: this.configService.get<string>('app.openAIApiKey'),
    });

    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-large', // latest OpenAI embedding model
      openAIApiKey: this.configService.get<string>('app.openAIApiKey'),
      dimensions: 1536,
    });

    this.pgVector = new PGVectorStore(this.embeddings, {
      postgresConnectionOptions: {
        host: this.configService.get<string>('database.host'),
        port: this.configService.get<number>('database.port'),
        user: this.configService.get<string>('database.username'),
        password: this.configService.get<string>('database.password'),
        database: this.configService.get<string>('database.database'),
      },
      tableName: 'embeddings',
      columns: {
        contentColumnName: 'chunk_content',
        vectorColumnName: 'embedding',
        metadataColumnName: 'metadata',
        idColumnName: 'id',
      },
    });
  }

  async ingest(createRagDto: CreateRagDto) {
    // CHUNKING
    const docs = domAwareSplit(createRagDto.html, createRagDto.url);
    // EMBEDDING and STORAGE
    await this.pgVector.addDocuments(docs);
    this.logger.log(`Ingested  chunks from ${createRagDto.url}`, 'RagService');
    return { success: true };
  }

  async getSimilarChunks(instruction: string, url: string = 'https://example.com', topK = 5) {
    // 1. Retrieve relevant chunks
    const chunks = await this.pgVector.similaritySearch(instruction, topK, {
      filter: { url },
    });

    this.logger.log(
      `Fetched ${chunks.length} chunks for instruction="${instruction}"`,
      'RagService'
    );

    // 2. Build prompt
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert information extractor.
       Always return only valid JSON.
       
       Rules:
        - If a field is not found, use null as its value and a confidence of 0.
        - Confidence should reflect how certain you are about the extraction (1 = very certain, 0 = not found/unknown).
        - Do not add any explanation or extra text outside the JSON.`,
      ],
      [
        'human',
        `Instruction: "{instruction}"

Return ONLY a valid JSON in the following format:
{{
  "url": "{url}",
  "instruction": "{instruction}",
  "parsed_fields": [list of fields inferred from instruction],
  "extracted": {{ "<field>": "<value or null>" }},
  "confidence": {{ "<field>": <0..1> }},
  "record_id": "{recordId}"
}}

Context:
{context}`,
      ],
    ]);

    // 3. Use JSON parser
    const parser = new JsonOutputParser();

    // 4. Build chain
    const chain = RunnableSequence.from([prompt, this.llm, parser]);

    // 5. Run chain
    const result = await chain.invoke({
      instruction,
      url,
      recordId: 1,
      context: chunks.map((c, i) => `--- Chunk ${i} ---\n${c.pageContent}`).join('\n\n'),
    });

    return result;
  }

  async extractTextFromHtml(createRagDto: CreateRagDto) {
    // CACHED : if data for this url is already in extracted_output_data and less than 2 days old, return it
    const ingestStatus = await this.ingest(createRagDto);
    if (ingestStatus.success) {
      return await this.getSimilarChunks(createRagDto.instruction, createRagDto.url, 5);
    }
  }
}

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
import { ExtractedOutputEntity } from './entities/extracted_output.entity';
type ExtractedResult = {
  url: string;
  instruction: string;
  parsed_fields: string[];
  extracted: Record<string, string | string[]>;
  confidence: Record<string, number>;
  summary_response: string;
};

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

@Injectable()
export class RagService {
  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;
  private pgVector: PGVectorStore;

  constructor(
    private configService: ConfigService,
    @InjectRepository(EmbeddingsEntity) private embeddingsRepository: Repository<EmbeddingsEntity>,
    @InjectRepository(ExtractedOutputEntity)
    private extractedOutputRepository: Repository<ExtractedOutputEntity>,
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
    console.log('in ingest');
    // CHUNKING
    const docs = domAwareSplit(createRagDto.html, createRagDto.url);
    // EMBEDDING and STORAGE
    await this.pgVector.addDocuments(docs);
    this.logger.log(`Ingested  chunks from ${createRagDto.url}`, 'RagService');
    return { success: true };
  }

  async getSimilarChunks(instruction: string, url: string = 'https://example.com', topK = 5) {
    // 1. Retrieve relevant chunks
    const chunks = await this.pgVector.similaritySearchWithScore(instruction, topK, {
      filter: { url: { $in: url } },
    });

    this.logger.log(
      `Fetched ${chunks.length} chunks for instruction="${instruction}"`,
      'RagService'
    );

    // 2. Build prompt
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert information extractor web crawler bot.
     Always return only valid JSON.

     Rules:
      - If a field is not found, use null as its value and a confidence of 0.
      - Confidence should inherited from context with conversion to percentage where 100 is certain and 0 is unknown.
      - Do not add any explanation or extra text outside the JSON.
      - In addition to extracted fields, generate a "summary_response" field.
      - The "summary_response" must be a Markdown-formatted text **mirroring the HTML structure** of the extracted data from {context}.
- Use the \`metadata.tag\` (such as \`div\`, \`section\`, \`p\`) to decide the hierarchy:
  - \`div\` → represent as a **Markdown heading (## or ### depending on nesting)**
  - \`section\` → represent as a **higher-level Markdown heading (##)**
  - \`p\` → represent as **paragraph text** under the right heading
- For each extracted field, include:
  - Its confidence score
  - Its extracted values (as bullet points if multiple)
- Follow strict GitHub Markdown structure, no extra explanation.
- Example of \`summary_response\`:

## Extracted Information. 

### Section: AI Studio Retail (confidence=0.92). 

- **Feature** 
  - AI Engines for Retail
  - Powered by AI Studio for Retail. 

### Div: Product Benefits (confidence=0.87)
- **Benefit**  
  - Faster deployment  
  - Scalable infrastructure. 

### Paragraph (confidence=0.75)
This section describes how AI Studio Retail accelerates AI adoption.`,
      ],
      [
        'human',
        `Instruction: "{instruction}"

Return ONLY a valid JSON in the following format:
{{
  "url": "{url}",
  "instructions": "{instruction}",
  "parsed_fields": [list of fields inferred from instruction],
  "extracted": {{ "<field>": "<value or null>" }},
  "confidence": {{ "<field>": <0..1> }},
  "summary_response": "<Markdown summary of extracted info with confidence>"
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
    const result = (await chain.invoke({
      instruction,
      url,
      recordId: 1,
      context: chunks
        .map(
          (c, i) => `--- Chunk ${i} (confidence=${(1 - c[1]).toFixed(3)}) ---
${c[0].pageContent}`
        )
        .join('\n\n'),
    })) as ExtractedResult;

    // 6. SAVE OUTPUT in DB
    const db = this.extractedOutputRepository.create(result);
    await this.extractedOutputRepository.save(db);
    return result;
  }

  async extractTextFromHtml(createRagDto: CreateRagDto) {
    // CACHED : if data for this url is already in extracted_output_data and less than 2 days old, don't need to ingest it
    const isUrlDataExists = await this.extractedOutputRepository.findOne({
      where: { url: createRagDto.url },
      order: { created_at: 'DESC' },
    });

    if (isUrlDataExists && isUrlDataExists.created_at > new Date(Date.now() - TWO_DAYS)) {
      return await this.getSimilarChunks(createRagDto.instruction, createRagDto.url, 5);
    } else {
      const ingestStatus = await this.ingest(createRagDto);
      if (ingestStatus.success) {
        return await this.getSimilarChunks(createRagDto.instruction, createRagDto.url, 5);
      }
    }
  }
}

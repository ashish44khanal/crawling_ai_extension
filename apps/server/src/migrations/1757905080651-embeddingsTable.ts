import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmbeddingsTable1757905080651 implements MigrationInterface {
  name = 'EmbeddingsTable1757905080651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    await queryRunner.query(
      `CREATE TABLE "embeddings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chunk_content" text NOT NULL, "embedding" vector(1536), "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_19b6b451e1ef345884caca1f544" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "embeddings"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS vector;`);
  }
}

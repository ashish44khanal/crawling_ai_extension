import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtractedOutputTable1757989343335 implements MigrationInterface {
  name = 'ExtractedOutputTable1757989343335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "extracted_output_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "instructions" text NOT NULL, "parsed_fields" jsonb, "extracted" jsonb, "confidence" jsonb, "summary_response" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_8643698e7fbaab779173a8a22ee" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "extracted_output_entity"`);
  }
}

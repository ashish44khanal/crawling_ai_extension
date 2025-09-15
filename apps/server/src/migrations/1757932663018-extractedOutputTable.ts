import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1757932663018 implements MigrationInterface {
  name = 'Migrations1757932663018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "extracted_output_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "instructions" text NOT NULL, "parsed_fields" character varying NOT NULL, "extracted" jsonb, "confidence" jsonb, "summary_response" text NOT NULL, CONSTRAINT "PK_8643698e7fbaab779173a8a22ee" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "extracted_output_entity"`);
  }
}

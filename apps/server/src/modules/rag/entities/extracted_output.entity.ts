import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('extracted_output_entity')
export class ExtractedOutputEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ type: 'text' })
  instructions: string;

  @Column()
  parsed_fields: string;

  @Column({ type: 'jsonb', nullable: true })
  extracted: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  confidence: Record<string, any>;

  @Column({ type: 'text' })
  summary_response: string;
}

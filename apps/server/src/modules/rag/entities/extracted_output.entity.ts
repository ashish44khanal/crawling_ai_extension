import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('extracted_output_entity')
export class ExtractedOutputEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ type: 'text' })
  instructions: string;

  @Column({ type: 'jsonb', nullable: true })
  parsed_fields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  extracted: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  confidence: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  summary_response: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}

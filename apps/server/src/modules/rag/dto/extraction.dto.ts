import { IsString, IsOptional, IsArray, IsObject, IsNotEmpty } from 'class-validator';

export class ExtractedResultDto {
  @IsOptional()
  @IsString()
  url: string | null;

  @IsString()
  @IsNotEmpty()
  instruction: string;

  @IsArray()
  @IsString({ each: true })
  parsed_fields: string[];

  @IsObject()
  extracted: Record<string, string | null>;

  @IsObject()
  confidence: Record<string, number>;
}

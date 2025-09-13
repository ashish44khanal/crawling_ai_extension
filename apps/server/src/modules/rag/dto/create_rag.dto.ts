import { IsString } from 'class-validator';

export class CreateRagDto {
  @IsString()
  url: string;

  @IsString()
  html: string;

  @IsString()
  instruction: string;
}

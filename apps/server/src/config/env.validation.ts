// src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsBoolean,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { Transform } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging', // Add Staging environment
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @Transform(({ value }) => parseInt(value, 10)) // Ensure PORT is a number
  @IsNumber()
  PORT: number;

  @IsString()
  OPENAI_API_KEY: string;

  @IsString()
  DB_HOST: string;

  @Transform(({ value }) => parseInt(value, 10)) // Ensure DB_PORT is a number
  @IsNumber()
  @Min(0)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @Transform(({ value }) => value === 'true') // Transform string 'true'/'false' to boolean
  @IsBoolean()
  DB_SYNCHRONIZE: boolean;

  @Transform(({ value }) => value === 'true') // Transform string 'true'/'false' to boolean
  @IsBoolean()
  DB_LOGGING: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true, // Helps with number/enum conversion from string
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false, // Ensure all properties in EnvironmentVariables class are present
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

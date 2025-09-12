// src/config/app.config.ts
import { registerAs } from '@nestjs/config';

// Define a TypeScript interface for type safety when accessing 'app' config
export interface AppConfig {
  port: number;
  environment: string;
  appUrl: string;
  appClientUrl: string;
  openAIApiKey: string;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.PORT!) || 3000, // Use validated process.env
    environment: process.env.NODE_ENV || 'dev',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    appClientUrl: process.env.APP_CLIENT_URL || 'http://localhost:4200',
    openAIApiKey: process.env.OPENAI_API_KEY || '',
  }),
);

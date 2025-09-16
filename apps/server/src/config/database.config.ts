// src/config/database.config.ts
import { registerAs } from '@nestjs/config';
export interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  autoLoadEntities: boolean;
  entities: string[];
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    type: 'postgres',
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    synchronize: Boolean(process.env.DB_SYNCHRONIZE),
    logging: process.env.DB_LOGGING === 'true',
    autoLoadEntities: true,
    entities: ['dist/**/*.entity.js'],
  })
);

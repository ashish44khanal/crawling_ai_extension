// This is data source for migration and seeder script only
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv'; // Import dotenv

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

dotenv.config({ path: envFile });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'test',
  password: process.env.DB_PASSWORD || 'test',
  database: process.env.DB_DATABASE || 'test',
  entities:
    process.env.NODE_ENV === 'development' ? ['src/**/*.entity.ts'] : ['dist/**/*.entity.js'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development', // Log queries in development
  migrations:
    process.env.NODE_ENV === 'development' ? ['src/migrations/*.ts'] : ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
});

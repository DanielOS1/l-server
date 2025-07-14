import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity.ts'], // Para migraciones (desarrollo)
  migrations: ['src/migrations/*.ts'], // Para migraciones (desarrollo)
  synchronize: false,
  logging: true,
  migrationsTableName: "migrations"
});

// Configuración separada para producción/compilado
export const AppDataSourceCompiled = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity.js'], // Para runtime (producción)
  migrations: ['dist/migrations/*.js'], // Para runtime (producción)
  synchronize: false,
  logging: true,
  migrationsTableName: "migrations"
});
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Un único DataSource, con rutas glob que cubren tanto ejecución vía
// ts-node (desarrollo, archivos .ts) como compilada (dist, archivos .js).
// El CLI de TypeORM exige exactamente un export de DataSource por archivo.
//
// Espeja la resolución de conexión de src/config/database.config.ts (usada
// por el server en runtime): prioriza DATABASE_URL y habilita SSL en
// producción, ya que Neon rechaza conexiones sin SSL.
const databaseUrl = process.env.DATABASE_URL;
const ssl =
  process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined;

export const AppDataSource = new DataSource(
  databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        entities: [__dirname + '/**/*.entity.{ts,js}'],
        migrations: [__dirname + '/migrations/*.{ts,js}'],
        synchronize: false,
        logging: true,
        migrationsTableName: 'migrations',
        ssl,
      }
    : {
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [__dirname + '/**/*.entity.{ts,js}'],
        migrations: [__dirname + '/migrations/*.{ts,js}'],
        synchronize: false,
        logging: true,
        migrationsTableName: 'migrations',
        ssl,
      },
);

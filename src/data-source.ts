import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Un único DataSource, con rutas glob que cubren tanto ejecución vía
// ts-node (desarrollo, archivos .ts) como compilada (dist, archivos .js).
// El CLI de TypeORM exige exactamente un export de DataSource por archivo.
export const AppDataSource = new DataSource({
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
});

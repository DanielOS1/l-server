import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  // Option 1: Prefer DATABASE_URL (Standard in Railway/Heroku)
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (databaseUrl) {
    console.log('✅ CONNECTING VIA DATABASE_URL');
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity.{ts,js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  // Option 2: Individual Variables (Manual setup)
  console.log('⚠️ DATABASE_URL missing. Trying individual variables...');
  console.log(' - HOST:', configService.get('DATABASE_HOST') || 'MISSING');

  const password = configService.get<string>('DATABASE_PASSWORD');
  if (!password) {
    throw new Error(
      'DATABASE_PASSWORD is not defined. Set DATABASE_URL or individual vars.',
    );
  }

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: parseInt(configService.get<string>('DATABASE_PORT') || '5432', 10),
    username: configService.get<string>('DATABASE_USERNAME'),
    password: password,
    database: configService.get<string>('DATABASE_NAME'),
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    autoLoadEntities: true,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };
};

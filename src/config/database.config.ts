import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  // Debug Log
  console.log('🔍 DEBUG ENV VARS:');
  console.log(' - HOST:', configService.get('DATABASE_HOST') || 'MISSING');
  console.log(' - USER:', configService.get('DATABASE_USERNAME') || 'MISSING');
  console.log(' - PASS Exists?:', !!configService.get('DATABASE_PASSWORD'));

  const password = configService.get<string>('DATABASE_PASSWORD');
  if (!password) {
    throw new Error(
      'DATABASE_PASSWORD is not defined (Check Railway Variables in Backend Service)',
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
    synchronize: process.env.NODE_ENV !== 'production', // Disable in production!
    logging: process.env.NODE_ENV !== 'production',
    autoLoadEntities: true,
  };
};

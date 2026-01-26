import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  // 1. INTENTO DE DEPURACIÓN (Muestra esto en los logs de Railway)
  console.log('--------------------------------------------------');
  console.log('🔍 DEBUG DATABASE CONFIG');
  const envUrl = configService.get<string>('DATABASE_URL');
  const processUrl = process.env.DATABASE_URL;

  console.log(
    `1. ConfigService value: ${envUrl ? 'DEFINED (Hidden)' : 'UNDEFINED/EMPTY'}`,
  );
  console.log(
    `2. Process.env value:   ${processUrl ? 'DEFINED (Hidden)' : 'UNDEFINED/EMPTY'}`,
  );

  // Imprimir todas las llaves disponibles para ver si hay errores de tipeo (ej: DATABASE_URL_ )
  const keys = Object.keys(process.env).filter(
    (key) => key.includes('DB') || key.includes('DATA'),
  );
  console.log('3. Env Keys detected:', keys);
  console.log('--------------------------------------------------');

  // 2. LÓGICA CORREGIDA (Prioridad: ConfigService -> process.env)
  const databaseUrl = envUrl || processUrl;

  if (databaseUrl) {
    console.log('✅ CONNECTING VIA DATABASE_URL');
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity.{ts,js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Cuidado en prod
      logging: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
      ssl: { rejectUnauthorized: false }, // En Railway/Heroku esto es casi siempre obligatorio
    };
  }

  // Option 2: Individual Variables
  console.log('⚠️ DATABASE_URL missing. Trying individual variables...');

  const password = configService.get<string>('DATABASE_PASSWORD');

  // Aquí es donde explota tu app actualmente
  if (!password) {
    // Si llegamos aquí, es porque databaseUrl falló Y password no está.
    // El log de arriba (Punto 3) te dirá qué variables existen realmente.
    throw new Error(
      '❌ FATAL: DATABASE_PASSWORD is not defined. Set DATABASE_URL or individual vars.',
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
    ssl: { rejectUnauthorized: false },
  };
};

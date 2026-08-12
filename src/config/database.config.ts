import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl =
    configService.get<string>('DATABASE_URL') || process.env.DATABASE_URL;

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity.{ts,js}'],
      migrations: [__dirname + '/../migrations/*.{ts,js}'],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
      extra: { max: 3 },
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : undefined,
    };
  }

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: parseInt(configService.get<string>('DATABASE_PORT') || '5432', 10),
    username: configService.get<string>('DATABASE_USERNAME'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
    autoLoadEntities: true,
    extra: { max: 3 },
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  };
};

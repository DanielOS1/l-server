import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const password = configService.get<string>('DATABASE_PASSWORD');
  if (!password) {
    throw new Error('DATABASE_PASSWORD is not defined');
  }

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: parseInt(configService.get<string>('DATABASE_PORT') || '5432', 10),
    username: configService.get<string>('DATABASE_USERNAME'),
    password: password,
    database: configService.get<string>('DATABASE_NAME'),
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: true,
    logging: true,
    autoLoadEntities: true,
  };
};

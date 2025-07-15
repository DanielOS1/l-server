// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { RoleModule } from './role/role.module';
import { SemesterController } from './semester/semester.controller';
import { SemesterModule } from './semester/semester.module';
import { PositionService } from './position/position.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: parseInt(configService.get('DATABASE_PORT') || '5432'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity.{ts,js}'],
        migrations: [__dirname + '/migrations/*.{ts,js}'],
        synchronize: false,
        logging: true,
        migrationsTableName: "migrations",
        autoLoadEntities: true, // Importante para NestJS
      }),
    }),
    AuthModule,
    UserModule,
    GroupModule,
    RoleModule,
    SemesterModule,
  ],
  controllers: [AppController, SemesterController],
  providers: [AppService, PositionService],
})
export class AppModule {}
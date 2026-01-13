// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group/group.module';
import { RoleModule } from './system/role/role.module';
import { SemesterController } from 'src/group/semester/semester.controller';
import { SemesterModule } from 'src/group/semester/semester.module';
import { PositionService } from './position/position.service';
import { ActivityController } from './activity/activity.controller';
import { AssignmentController } from './assignment/assignment.controller';
import { PositionModule } from './position/position.module';
import { ActivityModule } from './activity/activity.module';
import { AssignmentModule } from './assignment/assignment.module';
import { GroupRoleModule } from './group/group-role/group-role.module';

import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    AuthModule,
    UserModule,
    AssignmentModule,
    PositionModule,
    ActivityModule,
    SemesterModule,
    GroupModule,
    RoleModule,
    GroupRoleModule,
  ],
  controllers: [
    AppController,
    SemesterController,
    ActivityController,
    AssignmentController,
  ],
  providers: [AppService, PositionService],
})
export class AppModule {}

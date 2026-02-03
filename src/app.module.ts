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
import { SemesterModule } from 'src/group/semester/semester.module';
import { PositionModule } from './position/position.module';
import { ActivityModule } from './activity/activity.module';
import { AssignmentModule } from './assignment/assignment.module';
import { GroupRoleModule } from './group/group-role/group-role.module';
import { GoalModule } from './finance/goal/goal.module';
import { SaleModule } from './finance/sale/sale.module';
import { SaleColumnModule } from './finance/sale-column/sale-column.module';
import { SaleRowModule } from './finance/sale-row/sale-row.module';

import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // ignoreEnvFile: true, // Removed to allow .env loading
      expandVariables: true,
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
    GoalModule,
    SaleModule,
    SaleColumnModule,
    SaleRowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

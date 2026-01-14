// src/assignment/assignment.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { ActivityModule } from '../activity/activity.module';
import { PositionModule } from '../position/position.module';
import { UserModule } from '../user/user.module';

import { Activity } from '../activity/entities/activity.entity';
import { Position } from '../position/entities/position.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment, Activity, Position, User]),
    forwardRef(() => ActivityModule),
    forwardRef(() => PositionModule),
    UserModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}

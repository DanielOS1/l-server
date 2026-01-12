// src/assignment/assignment.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { ActivityModule } from '../activity/activity.module';
import { PositionModule } from '../position/position.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment]),
    forwardRef(() => ActivityModule),
    forwardRef(() => PositionModule),
    UserModule // UserModule no necesita forwardRef normalmente
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService]
})
export class AssignmentModule {}
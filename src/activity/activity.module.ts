import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { SemesterModule } from 'src/group/semester/semester.module';
import { AssignmentModule } from 'src/assignment/assignment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    forwardRef(() => SemesterModule),
    forwardRef(() => AssignmentModule),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}

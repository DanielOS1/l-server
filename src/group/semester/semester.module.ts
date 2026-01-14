import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { SemesterService } from './semester.service';
import { SemesterController } from './semester.controller';
import { PositionModule } from 'src/position/position.module';
import { ActivityModule } from 'src/activity/activity.module';

import { Group } from '../group/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Semester, Group]),
    forwardRef(() => PositionModule),
    forwardRef(() => ActivityModule),
  ],
  controllers: [SemesterController],
  providers: [SemesterService],
  exports: [SemesterService],
})
export class SemesterModule {}

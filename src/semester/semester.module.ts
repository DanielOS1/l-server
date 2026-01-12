import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { SemesterService } from './semester.service';
import { SemesterController } from './semester.controller';
import { PositionModule } from '../position/position.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Semester]),
    forwardRef(() => PositionModule),
    forwardRef(() => ActivityModule)
  ],
  controllers: [SemesterController],
  providers: [SemesterService],
  exports: [SemesterService]
})
export class SemesterModule {}
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { SemesterModule } from 'src/group/semester/semester.module';

import { Semester } from 'src/group/semester/entities/semester.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position, Semester]),
    forwardRef(() => SemesterModule),
  ],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}

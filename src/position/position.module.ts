import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { SemesterModule } from 'src/group/semester/semester.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position]),
    forwardRef(() => SemesterModule),
  ],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}

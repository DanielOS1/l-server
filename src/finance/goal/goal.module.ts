import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { GoalService } from './goal.service';
import { GoalController } from './goal.controller';
import { Group } from '../../group/group/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Group])],
  controllers: [GoalController],
  providers: [GoalService],
  exports: [GoalService],
})
export class GoalModule {}

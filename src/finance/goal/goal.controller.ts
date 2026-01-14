import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Goal } from './entities/goal.entity';

@Controller('goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  create(@Body() createGoalDto: CreateGoalDto): Promise<Goal> {
    return this.goalService.create(createGoalDto);
  }

  @Get()
  findAll(@Query('groupId') groupId: string): Promise<Goal[]> {
    if (!groupId) throw new BadRequestException('groupId is required');
    return this.goalService.findAllByGroup(groupId);
  }

  @Get('active')
  findActive(@Query('groupId') groupId: string): Promise<Goal> {
    if (!groupId) throw new BadRequestException('groupId is required');
    return this.goalService.findActiveByGroup(groupId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Goal> {
    return this.goalService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ): Promise<Goal> {
    return this.goalService.update(id, updateGoalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.goalService.remove(id);
  }
}

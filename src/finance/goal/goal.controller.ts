import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Request,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Goal } from './entities/goal.entity';

@Controller('goal')
@UseGuards(AuthGuard('jwt'))
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  create(
    @Body() createGoalDto: CreateGoalDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Goal> {
    return this.goalService.create(createGoalDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Goal[]> {
    if (!groupId) throw new BadRequestException('groupId is required');
    return this.goalService.findAllByGroup(groupId, req.user.userId);
  }

  @Get('active')
  findActive(
    @Query('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Goal> {
    if (!groupId) throw new BadRequestException('groupId is required');
    return this.goalService.findActiveByGroup(groupId, req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Goal> {
    return this.goalService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Goal> {
    return this.goalService.update(id, updateGoalDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.goalService.remove(id, req.user.userId);
  }
}

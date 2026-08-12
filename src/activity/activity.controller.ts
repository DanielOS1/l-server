import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Request,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity } from './entities/activity.entity';

@Controller('activity')
@UseGuards(AuthGuard('jwt'))
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Activity> {
    return this.activityService.create(createActivityDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('semesterId') semesterId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Activity[]> {
    if (!semesterId) {
      throw new BadRequestException('semesterId is required');
    }
    return this.activityService.findAllBySemester(semesterId, req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Activity> {
    return this.activityService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Activity> {
    return this.activityService.update(id, updateActivityDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.activityService.remove(id, req.user.userId);
  }
}

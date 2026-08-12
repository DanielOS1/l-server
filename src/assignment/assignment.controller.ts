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
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';

@Controller('assignment')
@UseGuards(AuthGuard('jwt'))
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  create(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Assignment> {
    return this.assignmentService.create(createAssignmentDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('activityId') activityId: string,
    @Query('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Assignment[]> {
    if (activityId) {
      return this.assignmentService.findAllByActivity(
        activityId,
        req.user.userId,
      );
    }
    if (userId) {
      return this.assignmentService.findAllByUser(userId, req.user.userId);
    }
    throw new BadRequestException(
      'Se requiere activityId o userId como parámetro',
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Assignment> {
    return this.assignmentService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Assignment> {
    return this.assignmentService.update(
      id,
      updateAssignmentDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.assignmentService.remove(id, req.user.userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';

@Controller('assignment')
@UseGuards(AuthGuard('jwt'))
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  create(@Body() createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    return this.assignmentService.create(createAssignmentDto);
  }

  @Get()
  findAll(
    @Query('activityId') activityId: string,
    @Query('userId') userId: string,
  ): Promise<Assignment[]> {
    if (activityId) {
      return this.assignmentService.findAllByActivity(activityId);
    }
    if (userId) {
      return this.assignmentService.findAllByUser(userId);
    }
    throw new BadRequestException('Se requiere activityId o userId como parámetro');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Assignment> {
    return this.assignmentService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    return this.assignmentService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.assignmentService.remove(id);
  }
}

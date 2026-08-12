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
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { Semester } from './entities/semester.entity';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Controller('semester')
@UseGuards(AuthGuard('jwt'))
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  create(
    @Body() createSemesterDto: CreateSemesterDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Semester> {
    return this.semesterService.create(
      createSemesterDto.groupId,
      createSemesterDto,
      req.user.userId,
    );
  }

  @Get()
  findAll(
    @Query('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Semester[]> {
    if (!groupId) {
      throw new BadRequestException('groupId is required');
    }
    return this.semesterService.findAllByGroup(groupId, req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Semester> {
    return this.semesterService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSemesterDto: UpdateSemesterDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Semester> {
    return this.semesterService.update(id, updateSemesterDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.semesterService.remove(id, req.user.userId);
  }
}

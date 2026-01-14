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
} from '@nestjs/common';
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { Semester } from './entities/semester.entity';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Controller('semester')
export class SemesterController {
  // Controller methods will be implemented here
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  create(@Body() createSemesterDto: CreateSemesterDto): Promise<Semester> {
    return this.semesterService.create(
      createSemesterDto.groupId,
      createSemesterDto,
    );
  }

  @Get()
  findAll(@Query('groupId') groupId: string): Promise<Semester[]> {
    if (!groupId) {
      throw new BadRequestException('groupId is required');
    }
    return this.semesterService.findAllByGroup(groupId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Semester> {
    return this.semesterService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ): Promise<Semester> {
    return this.semesterService.update(id, updateSemesterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.semesterService.remove(id);
  }
}

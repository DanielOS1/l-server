import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
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
        return this.semesterService.create(createSemesterDto);
    }

    @Get()
    findAll(): Promise<Semester[]> {
        return this.semesterService.findAll();
    }

    @Get(':id')
    getSemesterById(@Param('id') id: string): Promise<Semester> {
        return this.semesterService.getSemesterById(id);
    }
    
    @Put(':id')
    updateSemester(@Param('id') id: string, @Body() updateSemesterDto: UpdateSemesterDto): Promise<Semester> {
        return this.semesterService.updateSemester(id, updateSemesterDto);
    }

    @Delete(':id')
    deleteSemester(@Param('id') id: string): Promise<void> {   
        return this.semesterService.deleteSemester(id);
    }
}

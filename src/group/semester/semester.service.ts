import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { Repository } from 'typeorm';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Injectable()
export class SemesterService {
    // Service methods will be implemented here
      constructor(
        @InjectRepository(Semester)
        private readonly userRepository: Repository<Semester>,
      ) {}


      async create(createSemesterDto: CreateSemesterDto): Promise<Semester> {
        const semester = this.userRepository.create(createSemesterDto);
        return this.userRepository.save(semester);
      }

      async findAll(): Promise<Semester[]> {
        return this.userRepository.find();
      }

      async getSemesterById(id: string): Promise<Semester> {
        const semester = await this.userRepository.findOne({ where: { id } });
        if (!semester) {
          throw new Error('Semester not found');
        }
        return semester;
      }
      
      async updateSemester(id: string, updateSemesterDto: UpdateSemesterDto): Promise<Semester> {
        const semester = await this.getSemesterById(id);
        Object.assign(semester, updateSemesterDto);
        return this.userRepository.save(semester);
      }

      async deleteSemester(id: string): Promise<void> {
        const semester = await this.getSemesterById(id);
        await this.userRepository.remove(semester);
      }
}

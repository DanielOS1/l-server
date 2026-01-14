import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { Repository } from 'typeorm';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { Group } from '../group/entities/group.entity';

@Injectable()
export class SemesterService {
  // Service methods will be implemented here
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(
    groupId: string,
    createSemesterDto: CreateSemesterDto,
  ): Promise<Semester> {
    const { startDate, endDate } = createSemesterDto;

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const semester = this.semesterRepository.create({
      ...createSemesterDto,
      group,
    });
    return this.semesterRepository.save(semester);
  }

  async findAllByGroup(groupId: string): Promise<Semester[]> {
    return this.semesterRepository.find({
      where: { group: { id: groupId } },
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Semester> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
      relations: ['group'],
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }
    return semester;
  }

  async update(
    id: string,
    updateSemesterDto: UpdateSemesterDto,
  ): Promise<Semester> {
    const semester = await this.findOne(id);

    if (updateSemesterDto.startDate && updateSemesterDto.endDate) {
      if (
        new Date(updateSemesterDto.startDate) >=
        new Date(updateSemesterDto.endDate)
      ) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateSemesterDto.startDate) {
      if (new Date(updateSemesterDto.startDate) >= new Date(semester.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateSemesterDto.endDate) {
      if (new Date(semester.startDate) >= new Date(updateSemesterDto.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    Object.assign(semester, updateSemesterDto);
    return this.semesterRepository.save(semester);
  }

  async remove(id: string): Promise<void> {
    const semester = await this.findOne(id);
    await this.semesterRepository.remove(semester);
  }
}

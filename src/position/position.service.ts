import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { Repository } from 'typeorm';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Semester } from '../group/semester/entities/semester.entity';
import { GroupAccessService } from '../common/group-access/group-access.service';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
    private readonly groupAccessService: GroupAccessService,
  ) {}

  async create(
    createPositionDto: CreatePositionDto,
    userId: string,
  ): Promise<Position> {
    const { semesterId } = createPositionDto;
    const semester = await this.semesterRepository.findOne({
      where: { id: semesterId },
      relations: ['group'],
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }
    await this.groupAccessService.assertMember(userId, semester.group.id);

    const position = this.positionRepository.create({
      ...createPositionDto,
      semester,
    });
    return this.positionRepository.save(position);
  }

  async findAllBySemester(
    semesterId: string,
    userId: string,
  ): Promise<Position[]> {
    const semester = await this.semesterRepository.findOne({
      where: { id: semesterId },
      relations: ['group'],
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }
    await this.groupAccessService.assertMember(userId, semester.group.id);

    return this.positionRepository.find({
      where: { semester: { id: semesterId } },
    });
  }

  async findOne(id: string, userId: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['semester', 'semester.group'],
    });
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    await this.groupAccessService.assertMember(
      userId,
      position.semester.group.id,
    );
    return position;
  }

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
    userId: string,
  ): Promise<Position> {
    const position = await this.findOne(id, userId);
    Object.assign(position, updatePositionDto);
    return this.positionRepository.save(position);
  }

  async remove(id: string, userId: string): Promise<void> {
    const position = await this.findOne(id, userId);
    await this.positionRepository.remove(position);
  }
}

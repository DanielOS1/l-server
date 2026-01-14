import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { Repository } from 'typeorm';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Semester } from '../group/semester/entities/semester.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
  ) {}

  async create(createPositionDto: CreatePositionDto): Promise<Position> {
    const { semesterId } = createPositionDto;
    const semester = await this.semesterRepository.findOne({
      where: { id: semesterId },
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    const position = this.positionRepository.create({
      ...createPositionDto,
      semester,
    });
    return this.positionRepository.save(position);
  }

  async findAllBySemester(semesterId: string): Promise<Position[]> {
    return this.positionRepository.find({
      where: { semester: { id: semesterId } },
    });
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['semester'],
    });
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    return position;
  }

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
  ): Promise<Position> {
    const position = await this.findOne(id);
    Object.assign(position, updatePositionDto);
    return this.positionRepository.save(position);
  }

  async remove(id: string): Promise<void> {
    const position = await this.findOne(id);
    await this.positionRepository.remove(position);
  }
}

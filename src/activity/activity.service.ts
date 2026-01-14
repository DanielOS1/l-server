import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Repository } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Semester } from '../group/semester/entities/semester.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const { semesterId, date } = createActivityDto;

    const semester = await this.semesterRepository.findOne({
      where: { id: semesterId },
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    const activityDate = new Date(date);
    if (
      activityDate < new Date(semester.startDate) ||
      activityDate > new Date(semester.endDate)
    ) {
      throw new BadRequestException(
        'Activity date must be within the semester range',
      );
    }

    const activity = this.activityRepository.create({
      ...createActivityDto,
      semester,
    });
    return this.activityRepository.save(activity);
  }

  async findAllBySemester(semesterId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { semester: { id: semesterId } },
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['semester'],
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return activity;
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    const activity = await this.findOne(id);

    if (updateActivityDto.date) {
      const semester = activity.semester; // Loaded in findOne
      const newDate = new Date(updateActivityDto.date);
      if (
        newDate < new Date(semester.startDate) ||
        newDate > new Date(semester.endDate)
      ) {
        throw new BadRequestException(
          'Activity date must be within the semester range',
        );
      }
    }

    Object.assign(activity, updateActivityDto);
    return this.activityRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    await this.activityRepository.remove(activity);
  }
}

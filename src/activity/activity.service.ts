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
import { ActivityPosition } from './entities/activity-position.entity';
import { Position } from '../position/entities/position.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
    @InjectRepository(ActivityPosition)
    private readonly activityPositionRepository: Repository<ActivityPosition>,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const { semesterId, date, activityPositions } = createActivityDto;

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
    const savedActivity = await this.activityRepository.save(activity);

    if (activityPositions && activityPositions.length > 0) {
      const positionsToSave = activityPositions.map((ap) => {
        return this.activityPositionRepository.create({
          activity: savedActivity,
          position: { id: ap.positionId } as Position,
          quantity: ap.quantity,
        });
      });
      await this.activityPositionRepository.save(positionsToSave);
      savedActivity.activityPositions = positionsToSave; // Populate for return
    }

    return savedActivity;
  }

  async findAllBySemester(semesterId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { semester: { id: semesterId } },
      relations: ['activityPositions', 'activityPositions.position'],
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: [
        'semester',
        'activityPositions',
        'activityPositions.position',
        'assignments',
        'assignments.user',
        'assignments.position',
      ],
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
    const updatedActivity = await this.activityRepository.save(activity);

    if (updateActivityDto.activityPositions) {
      // Remove existing positions
      await this.activityPositionRepository.delete({ activity: { id: id } });

      // Add new positions
      const positionsToSave = updateActivityDto.activityPositions.map((ap) => {
        return this.activityPositionRepository.create({
          activity: updatedActivity,
          position: { id: ap.positionId } as Position,
          quantity: ap.quantity,
        });
      });
      await this.activityPositionRepository.save(positionsToSave);
      updatedActivity.activityPositions = positionsToSave;
    }

    return this.findOne(id); // Return full object with relations
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    await this.activityRepository.remove(activity);
  }
}

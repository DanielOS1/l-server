import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Group } from '../../group/group/entities/group.entity';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createGoalDto: CreateGoalDto): Promise<Goal> {
    const { groupId, isActive } = createGoalDto;

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Group not found');

    if (isActive) {
      const activeGoal = await this.goalRepository.findOne({
        where: { group: { id: groupId }, isActive: true },
      });
      if (activeGoal) {
        throw new BadRequestException(
          'There is already an active goal for this group.',
        );
      }
    }

    const goal = this.goalRepository.create({
      ...createGoalDto,
      group,
    });
    return this.goalRepository.save(goal);
  }

  async findAllByGroup(groupId: string): Promise<Goal[]> {
    return this.goalRepository.find({
      where: { group: { id: groupId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByGroup(groupId: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { group: { id: groupId }, isActive: true },
    });
    if (!goal)
      throw new NotFoundException('No active goal found for this group');
    return goal;
  }

  async findOne(id: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id },
      relations: ['group'],
    });
    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.findOne(id);

    // If setting to active, check logic again
    if (updateGoalDto.isActive === true && !goal.isActive) {
      const activeGoal = await this.goalRepository.findOne({
        where: { group: { id: goal.group.id }, isActive: true },
      });
      if (activeGoal && activeGoal.id !== id) {
        throw new BadRequestException(
          'There is already an active goal for this group.',
        );
      }
    }

    Object.assign(goal, updateGoalDto);
    return this.goalRepository.save(goal);
  }

  async remove(id: string): Promise<void> {
    const goal = await this.findOne(id);
    await this.goalRepository.remove(goal);
  }
}

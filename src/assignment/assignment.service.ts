import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Activity } from '../activity/entities/activity.entity';
import { ActivityPosition } from '../activity/entities/activity-position.entity';
import { Position } from '../position/entities/position.entity';
import { User } from '../user/entities/user.entity';
import { UserGroup } from '../group/user-group/entities/user-group.entity';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(ActivityPosition)
    private readonly activityPositionRepository: Repository<ActivityPosition>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const { activityId, positionId, userId, notes } = createAssignmentDto;

    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
      relations: ['semester', 'semester.group'],
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');

    const position = await this.positionRepository.findOne({
      where: { id: positionId },
      relations: ['semester'],
    });
    if (!position) throw new NotFoundException('Posición no encontrada');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Actividad y posición deben pertenecer al mismo semestre
    if (activity.semester.id !== position.semester.id) {
      throw new BadRequestException(
        'La actividad y la posición deben pertenecer al mismo semestre',
      );
    }

    // El usuario debe ser miembro del grupo dueño del semestre
    const groupId = activity.semester.group.id;
    const membership = await this.userGroupRepository.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
    if (!membership) {
      throw new ForbiddenException(
        'El usuario no es miembro del grupo al que pertenece esta actividad',
      );
    }

    // No permitir asignaciones duplicadas
    const duplicate = await this.assignmentRepository.findOne({
      where: {
        activity: { id: activityId },
        position: { id: positionId },
        user: { id: userId },
      },
    });
    if (duplicate) {
      throw new BadRequestException(
        'Este usuario ya está asignado a esa posición en esta actividad',
      );
    }

    // Verificar capacidad de la posición en la actividad
    const activityPosition = await this.activityPositionRepository.findOne({
      where: { activity: { id: activityId }, position: { id: positionId } },
    });
    if (activityPosition) {
      const currentCount = await this.assignmentRepository.count({
        where: { activity: { id: activityId }, position: { id: positionId } },
      });
      if (currentCount >= activityPosition.quantity) {
        throw new BadRequestException(
          `La posición "${position.name}" ya alcanzó su capacidad máxima (${activityPosition.quantity})`,
        );
      }
    }

    const assignment = this.assignmentRepository.create({
      activity,
      position,
      user,
      notes,
    });
    return this.assignmentRepository.save(assignment);
  }

  async findAllByActivity(activityId: string): Promise<Assignment[]> {
    return this.assignmentRepository.find({
      where: { activity: { id: activityId } },
      relations: ['user', 'position'],
    });
  }

  async findAllByUser(userId: string): Promise<Assignment[]> {
    return this.assignmentRepository.find({
      where: { user: { id: userId } },
      relations: ['activity', 'activity.semester', 'position'],
    });
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['activity', 'position', 'user'],
    });
    if (!assignment) throw new NotFoundException('Asignación no encontrada');
    return assignment;
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    const assignment = await this.findOne(id);
    if (updateAssignmentDto.notes !== undefined) {
      assignment.notes = updateAssignmentDto.notes;
    }
    return this.assignmentRepository.save(assignment);
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await this.assignmentRepository.remove(assignment);
  }
}

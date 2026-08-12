import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupRole } from './entities/group-role.entity';
import { CreateGroupRoleDto } from './dto/create-group-role.dto';
import { UpdateGroupRoleDto } from './dto/update-group-role.dto';
import { Group } from '../group/entities/group.entity';
import { UserGroup } from '../user-group/entities/user-group.entity';
import { ROLE_LEVELS } from './constants/role-levels.constant';

@Injectable()
export class GroupRoleService {
  constructor(
    @InjectRepository(GroupRole)
    private readonly groupRoleRepository: Repository<GroupRole>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
  ) {}

  /**
   * Validates that the requester is a group member with:
   * - At least MANAGER level (75) to manage any role
   * - A level strictly greater than targetLevel
   */
  private async validateRoleManagement(
    userId: string,
    groupId: string,
    targetLevel: number,
  ): Promise<GroupRole> {
    const userGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
      relations: ['groupRole'],
    });

    if (!userGroup) {
      throw new ForbiddenException('You are not a member of this group');
    }

    if (
      !userGroup.groupRole ||
      userGroup.groupRole.level < ROLE_LEVELS.MANAGER
    ) {
      throw new ForbiddenException(
        'You need Manager level or higher to manage roles',
      );
    }

    if (userGroup.groupRole.level <= targetLevel) {
      throw new ForbiddenException(
        'You do not have enough authority to manage this role level',
      );
    }

    return userGroup.groupRole;
  }

  async create(
    userId: string,
    createGroupRoleDto: CreateGroupRoleDto,
  ): Promise<GroupRole> {
    const { groupId, ...roleData } = createGroupRoleDto;

    const newRoleLevel = roleData.level ?? ROLE_LEVELS.MEMBER;

    if (newRoleLevel > ROLE_LEVELS.OWNER) {
      throw new BadRequestException(
        'El nivel máximo asignable para un rol es 100',
      );
    }

    await this.validateRoleManagement(userId, groupId, newRoleLevel);

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const groupRole = this.groupRoleRepository.create({
      ...roleData,
      level: newRoleLevel,
      group,
      isSystem: false,
    });

    return this.groupRoleRepository.save(groupRole);
  }

  async findAll(groupId: string, userId: string): Promise<GroupRole[]> {
    if (!groupId) {
      throw new NotFoundException('Group ID is required to list roles');
    }

    const userGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
    });

    if (!userGroup) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.groupRoleRepository.find({
      where: { group: { id: groupId } },
      relations: ['group'],
      order: { level: 'DESC' },
    });
  }

  async findOne(id: string): Promise<GroupRole> {
    const groupRole = await this.groupRoleRepository.findOne({
      where: { id },
      relations: ['group'],
    });

    if (!groupRole) {
      throw new NotFoundException(`GroupRole with ID ${id} not found`);
    }

    return groupRole;
  }

  async update(
    userId: string,
    id: string,
    updateGroupRoleDto: UpdateGroupRoleDto,
  ): Promise<GroupRole> {
    const groupRole = await this.groupRoleRepository.findOne({
      where: { id },
      relations: ['group'],
    });

    if (!groupRole) {
      throw new NotFoundException(`GroupRole with ID ${id} not found`);
    }

    if (groupRole.isSystem) {
      throw new BadRequestException(
        'Cannot modify core attributes of a system role',
      );
    }

    // Check authority over the current level
    await this.validateRoleManagement(
      userId,
      groupRole.group.id,
      groupRole.level,
    );

    // If changing level, also check authority over the new level
    if (updateGroupRoleDto.level !== undefined) {
      if (updateGroupRoleDto.level > ROLE_LEVELS.OWNER) {
        throw new BadRequestException(
          'El nivel máximo asignable para un rol es 100',
        );
      }
      await this.validateRoleManagement(
        userId,
        groupRole.group.id,
        updateGroupRoleDto.level,
      );
    }

    const { groupId: _groupId, ...updateData } = updateGroupRoleDto;
    Object.assign(groupRole, updateData);

    return this.groupRoleRepository.save(groupRole);
  }

  async remove(userId: string, id: string): Promise<void> {
    const groupRole = await this.groupRoleRepository.findOne({
      where: { id },
      relations: ['group'],
    });

    if (!groupRole) {
      throw new NotFoundException(`GroupRole with ID ${id} not found`);
    }

    if (groupRole.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    await this.validateRoleManagement(
      userId,
      groupRole.group.id,
      groupRole.level,
    );

    const usageCount = await this.userGroupRepository.count({
      where: { groupRole: { id } },
    });
    if (usageCount > 0) {
      throw new BadRequestException(
        'Cannot delete role because it is assigned to users. Reassign them first.',
      );
    }

    await this.groupRoleRepository.remove(groupRole);
  }
}

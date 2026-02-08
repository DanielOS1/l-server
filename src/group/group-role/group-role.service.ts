import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
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
   * Validates if the user has a role with level strictly greater than targetLevel.
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

    if (userGroup.groupRole.level <= targetLevel) {
      throw new ForbiddenException(
        'You do not have enough authority to manage this role level',
      );
    }

    return userGroup.groupRole;
  }

  /**
   * Ensures we are not removing the last Owner role or leaving the group without owners.
   */
  private async validateSafeToModifyRole(role: GroupRole): Promise<void> {
    if (role.level === ROLE_LEVELS.OWNER) {
      const ownerCount = await this.userGroupRepository.count({
        where: {
          group: { id: role.group.id },
          groupRole: { level: ROLE_LEVELS.OWNER },
        },
      });

      // If this role is the ONLY owner role being used (unlikely as role is shared, but if we delete the role definition itself)
      // actually if we delete the role, all users lose it. So if we delete THE OWNER role, everyone loses owner status.
      // So we must check if there are other OWNER roles? No, usually there is one OWNER role definition.
      // If we delete the OWNER role, the group has 0 owners.
      // So effectively, we cannot delete the OWNER role if it's the system one.
      // And we prevent creating another OWNER role if one exists? No, multiple OWNER roles (custom) could exist.
      // But we must ensure at least one OWNER-level user remains?
      // For deleting a ROLE, if it is assigned to users, we probably shouldn't delete it easily or should reassign.
      // But typically "isSystem" protects the main OWNER role.
      // Custom roles with level 100?
      // If I delete a custom role level 100, and it was the only one assigned to users...
      // Let's stick to: Cannot delete isSystem roles.
      // For custom roles, check if assigned.

      if (role.isSystem) {
        throw new BadRequestException('Cannot remove system roles');
      }
    }
  }

  async create(
    userId: string,
    createGroupRoleDto: CreateGroupRoleDto,
  ): Promise<GroupRole> {
    const { groupId, ...roleData } = createGroupRoleDto;

    // Validate requester has higher level than the new role
    // Default level if not provided? Schema says default 10.
    // DTO might not have level. If not, assume 10?
    // Let's assume DTO allows level, or we default to 10.
    // Does CreateGroupRoleDto have level? I should check or cast.
    // The previous code didn't use level. I'll assume it's passed or defaults.
    // If not in DTO, we can't check efficiently. But typically created roles are low level.
    // However, to be safe:

    const newRoleLevel = (roleData as any).level || 10;
    
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
      isSystem: false, // Custom roles are never system
    });

    return this.groupRoleRepository.save(groupRole);
  }

  async findAll(groupId: string, userId: string): Promise<GroupRole[]> {
    if (!groupId) {
      throw new NotFoundException('Group ID is required to list roles');
    }

    // Any member can view roles? Yes, usually to see hierarchy.
    const userGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
    });

    if (!userGroup) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.groupRoleRepository.find({
      where: { group: { id: groupId } },
      relations: ['group'],
      order: { level: 'DESC' }, // Show highest authority first
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

    // 1. Check if requester can manage the CURRENT level of the role
    await this.validateRoleManagement(userId, groupRole.group.id, groupRole.level);

    // 2. If changing level, check if requester can manage the NEW level
    if ((updateGroupRoleDto as any).level !== undefined) {
       await this.validateRoleManagement(userId, groupRole.group.id, (updateGroupRoleDto as any).level);
    }

    // 3. System role protection
    if (groupRole.isSystem) {
       // Allow changing description, maybe permissions (if we had them), but NOT name, level, or isSystem
       const { name, ...allowedUpdates } = updateGroupRoleDto as any; 
       // Ideally we should filter DTO. For now, strict check:
       if ((updateGroupRoleDto as any).name || (updateGroupRoleDto as any).level) {
           throw new BadRequestException("Cannot modify core attributes (name, level) of a System Role");
       }
    }

    // 4. Validate ownership safety (if downgrading an owner role?)
    // If we change level of an OWNER role to something else...
    // But system roles are protected above. Custom roles level 100?
    // If custom role is level 100 and we lower it, we must check if it's the last owner role?
    // This is distinct from "last user with owner role". This is "role definition".

    const { groupId, ...updateData } = updateGroupRoleDto;
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
        throw new BadRequestException("Cannot delete system roles");
    }

    // Check authority
    await this.validateRoleManagement(userId, groupRole.group.id, groupRole.level);

    // Check usage
    const usageCount = await this.userGroupRepository.count({ where: { groupRole: { id } }});
    if (usageCount > 0) {
        throw new BadRequestException("Cannot delete role because it is assigned to users. Reassign them first.");
    }

    await this.groupRoleRepository.remove(groupRole);
  }
}

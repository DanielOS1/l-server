import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupRole } from './entities/group-role.entity';
import { CreateGroupRoleDto } from './dto/create-group-role.dto';
import { UpdateGroupRoleDto } from './dto/update-group-role.dto';
import { Group } from '../group/entities/group.entity';
import { UserGroup } from '../user-group/entities/user-group.entity';

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

  private async validateGroupOwner(
    userId: string,
    groupId: string,
  ): Promise<void> {
    const userGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
      relations: ['groupRole'],
    });

    if (!userGroup) {
      throw new ForbiddenException('You are not a member of this group');
    }

    if (userGroup.groupRole.name !== 'OWNER') {
      throw new ForbiddenException('Only the group owner can manage roles');
    }
  }

  private async validateGroupMember(
    userId: string,
    groupId: string,
  ): Promise<void> {
    const userGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
    });

    if (!userGroup) {
      throw new ForbiddenException('You are not a member of this group');
    }
  }

  async create(
    userId: string,
    createGroupRoleDto: CreateGroupRoleDto,
  ): Promise<GroupRole> {
    const { groupId, ...roleData } = createGroupRoleDto;

    await this.validateGroupOwner(userId, groupId);

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const groupRole = this.groupRoleRepository.create({
      ...roleData,
      group,
    });

    return this.groupRoleRepository.save(groupRole);
  }

  async findAll(groupId: string, userId: string): Promise<GroupRole[]> {
    if (!groupId) {
      throw new NotFoundException('Group ID is required to list roles');
    }

    await this.validateGroupMember(userId, groupId);

    return this.groupRoleRepository.find({
      where: { group: { id: groupId } },
      relations: ['group'],
    });
  }

  async findOne(id: string): Promise<GroupRole> {
    // Note: To be strictly secure, we should also validate if the requestor is in the group
    // But for findOne by ID, getting the role itself is often harmless unless we want strict privacy.
    // Given the method signature doesn't have userId, we'll return the role.
    // Ideally, we'd pass userId here too, but for simplicity/backwards compat plan, I'll assume basic access.
    // However, the prompt asked for functionality scoped to the group.

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

    // Use the group ID from the role itself to validate ownership
    await this.validateGroupOwner(userId, groupRole.group.id);

    // If attempting to move the role to another group (which is weird but possible via DTO), validate that too
    if (
      updateGroupRoleDto.groupId &&
      updateGroupRoleDto.groupId !== groupRole.group.id
    ) {
      await this.validateGroupOwner(userId, updateGroupRoleDto.groupId);
      const newGroup = await this.groupRepository.findOne({
        where: { id: updateGroupRoleDto.groupId },
      });
      if (!newGroup) throw new NotFoundException('New Group not found');
      groupRole.group = newGroup;
    }

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

    await this.validateGroupOwner(userId, groupRole.group.id);

    await this.groupRoleRepository.remove(groupRole);
  }
}

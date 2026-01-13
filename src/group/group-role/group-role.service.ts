import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupRole } from './entities/group-role.entity';
import { CreateGroupRoleDto } from './dto/create-group-role.dto';
import { UpdateGroupRoleDto } from './dto/update-group-role.dto';
import { Group } from '../group/entities/group.entity';

@Injectable()
export class GroupRoleService {
  constructor(
    @InjectRepository(GroupRole)
    private readonly groupRoleRepository: Repository<GroupRole>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createGroupRoleDto: CreateGroupRoleDto): Promise<GroupRole> {
    const { groupId, ...roleData } = createGroupRoleDto;

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

  async findAll(): Promise<GroupRole[]> {
    return this.groupRoleRepository.find({
      relations: ['group'],
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
    id: string,
    updateGroupRoleDto: UpdateGroupRoleDto,
  ): Promise<GroupRole> {
    const groupRole = await this.groupRoleRepository.findOne({ where: { id } });

    if (!groupRole) {
      throw new NotFoundException(`GroupRole with ID ${id} not found`);
    }

    const { groupId, ...updateData } = updateGroupRoleDto;

    if (groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: groupId },
      });
      if (!group) {
        throw new NotFoundException(`Group with ID ${groupId} not found`);
      }
      groupRole.group = group;
    }

    Object.assign(groupRole, updateData);

    return this.groupRoleRepository.save(groupRole);
  }

  async remove(id: string): Promise<void> {
    const result = await this.groupRoleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`GroupRole with ID ${id} not found`);
    }
  }
}

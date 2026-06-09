import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UserGroup } from '../user-group/entities/user-group.entity';
import { User } from '../../user/entities/user.entity';
import { GroupResponseDto } from './dto/group-response.dto';
import { GroupRole } from '../group-role/entities/group-role.entity';
import { ROLE_LEVELS } from '../group-role/constants/role-levels.constant';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GroupRole)
    private readonly groupRoleRepository: Repository<GroupRole>,
  ) {}

  async getById(id: string): Promise<GroupResponseDto> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: [
        'userGroups',
        'userGroups.user',
        'userGroups.groupRole',
        'roles',
        'semesters',
      ],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return plainToInstance(GroupResponseDto, group, {
      excludeExtraneousValues: false,
    });
  }

  async getAll(): Promise<GroupResponseDto[]> {
    const groups = await this.groupRepository.find({
      relations: [
        'userGroups',
        'userGroups.user',
        'userGroups.groupRole',
        'roles',
      ],
    });

    return plainToInstance(GroupResponseDto, groups, {
      excludeExtraneousValues: false,
    });
  }

  async getByUserId(userId: string): Promise<GroupResponseDto[]> {
    const userGroups = await this.userGroupRepository.find({
      where: { user: { id: userId } },
      relations: [
        'group',
        'groupRole',
        'group.userGroups',
        'group.userGroups.user',
        'group.roles',
      ],
    });

    const groups = userGroups.map((ug) => ug.group);

    return plainToInstance(GroupResponseDto, groups, {
      excludeExtraneousValues: false,
    });
  }

  async create(userId: string, createGroupDto: CreateGroupDto): Promise<GroupResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName'],
    });

    if (!user) {
      throw new NotFoundException('Usuario creador no encontrado');
    }

    const newGroup = this.groupRepository.create(createGroupDto);
    const group = await this.groupRepository.save(newGroup);

    const ownerRole = await this.groupRoleRepository.save(
      this.groupRoleRepository.create({
        name: 'OWNER',
        description: 'Propietario del grupo',
        isDefault: false,
        level: ROLE_LEVELS.OWNER,
        isSystem: true,
        group,
      }),
    );

    await this.groupRoleRepository.save(
      this.groupRoleRepository.create({
        name: 'ADMIN',
        description: 'Administrador del grupo',
        isDefault: false,
        level: ROLE_LEVELS.ADMIN,
        isSystem: true,
        group,
      }),
    );

    await this.groupRoleRepository.save(
      this.groupRoleRepository.create({
        name: 'MEMBER',
        description: 'Miembro del grupo',
        isDefault: true,
        level: ROLE_LEVELS.MEMBER,
        isSystem: true,
        group,
      }),
    );

    await this.userGroupRepository.save(
      this.userGroupRepository.create({
        user,
        group,
        isCreator: true,
        groupRole: ownerRole,
      }),
    );

    return this.getById(group.id);
  }

  async addMember(
    groupId: string,
    userId: string,
    requesterId: string,
  ): Promise<GroupResponseDto> {
    const [group, user] = await Promise.all([
      this.groupRepository.findOne({ where: { id: groupId } }),
      this.userRepository.findOne({ where: { id: userId } }),
    ]);

    if (!group) throw new NotFoundException('Group not found');
    if (!user) throw new NotFoundException('User to add not found');

    // Verificar que el requester sea miembro del grupo
    const requesterGroup = await this.userGroupRepository.findOne({
      where: { group: { id: groupId }, user: { id: requesterId } },
      relations: ['groupRole'],
    });

    if (!requesterGroup) {
      throw new ForbiddenException('No eres miembro de este grupo');
    }

    // Verificar si el usuario ya es miembro
    const existing = await this.userGroupRepository.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });

    if (existing) {
      throw new BadRequestException('El usuario ya es miembro del grupo');
    }

    const memberRole = await this.groupRoleRepository.findOne({
      where: { group: { id: groupId }, name: 'MEMBER' },
    });

    if (!memberRole) {
      throw new NotFoundException('Default member role not found for group');
    }

    await this.userGroupRepository.save(
      this.userGroupRepository.create({
        user,
        group,
        isCreator: false,
        groupRole: memberRole,
      }),
    );

    return this.getById(groupId);
  }

  async assignRole(
    groupId: string,
    userId: string,
    roleId: string,
    requesterId: string,
  ): Promise<GroupResponseDto> {
    const [userGroup, role, requesterUserGroup] = await Promise.all([
      this.userGroupRepository.findOne({
        where: { group: { id: groupId }, user: { id: userId } },
        relations: ['groupRole'],
      }),
      this.groupRoleRepository.findOne({
        where: { id: roleId, group: { id: groupId } },
        relations: ['group'],
      }),
      this.userGroupRepository.findOne({
        where: { group: { id: groupId }, user: { id: requesterId } },
        relations: ['groupRole'],
      }),
    ]);

    if (!userGroup) throw new NotFoundException('El usuario no es miembro de este grupo');
    if (!role) throw new NotFoundException('Rol no encontrado en este grupo');
    if (!requesterUserGroup) throw new ForbiddenException('No eres miembro de este grupo');

    // El requester debe tener mayor nivel que el target
    if (requesterUserGroup.groupRole.level <= userGroup.groupRole.level) {
      throw new ForbiddenException(
        'No puedes modificar a un usuario con igual o mayor jerarquía que la tuya',
      );
    }

    // El requester solo puede asignar roles menores al suyo
    if (requesterUserGroup.groupRole.level <= role.level) {
      throw new ForbiddenException(
        'No puedes asignar un rol con igual o mayor autoridad que la tuya',
      );
    }

    // Proteger al último Owner
    if (
      userGroup.groupRole.level === ROLE_LEVELS.OWNER &&
      role.level !== ROLE_LEVELS.OWNER
    ) {
      const ownerCount = await this.userGroupRepository.count({
        where: {
          group: { id: groupId },
          groupRole: { level: ROLE_LEVELS.OWNER },
        },
      });
      if (ownerCount <= 1) {
        throw new ForbiddenException(
          'No puedes degradar al último owner del grupo. Asigna otro owner primero.',
        );
      }
    }

    userGroup.groupRole = role;
    await this.userGroupRepository.save(userGroup);

    return this.getById(groupId);
  }

  async removeMember(
    groupId: string,
    targetUserId: string,
    requesterId: string,
  ): Promise<void> {
    const [targetUserGroup, requesterUserGroup] = await Promise.all([
      this.userGroupRepository.findOne({
        where: { group: { id: groupId }, user: { id: targetUserId } },
        relations: ['groupRole'],
      }),
      this.userGroupRepository.findOne({
        where: { group: { id: groupId }, user: { id: requesterId } },
        relations: ['groupRole'],
      }),
    ]);

    if (!targetUserGroup) throw new NotFoundException('El usuario no es miembro de este grupo');
    if (!requesterUserGroup) throw new ForbiddenException('No eres miembro de este grupo');

    // No puedes remover a alguien de igual o mayor jerarquía
    if (requesterUserGroup.groupRole.level <= targetUserGroup.groupRole.level) {
      throw new ForbiddenException(
        'No puedes remover a un usuario con igual o mayor jerarquía que la tuya',
      );
    }

    // Proteger al último Owner
    if (targetUserGroup.groupRole.level === ROLE_LEVELS.OWNER) {
      const ownerCount = await this.userGroupRepository.count({
        where: {
          group: { id: groupId },
          groupRole: { level: ROLE_LEVELS.OWNER },
        },
      });
      if (ownerCount <= 1) {
        throw new ForbiddenException(
          'No puedes remover al último owner del grupo.',
        );
      }
    }

    await this.userGroupRepository.remove(targetUserGroup);
  }
}

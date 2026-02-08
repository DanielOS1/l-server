import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  //Obtener un grupo por id
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
  //Obtener todos los grupos
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

  // Obtener grupos de un usuario especifico
  async getByUserId(userId: string): Promise<GroupResponseDto[]> {
    const userGroups = await this.userGroupRepository.find({
      where: { user: { id: userId } },
      relations: [
        'group',
        'groupRole',
        'group.userGroups',
        'group.userGroups.user',
        'group.roles',
      ], // Bring dependencies for mapping
    });

    const groups = userGroups.map((ug) => ug.group);

    return plainToInstance(GroupResponseDto, groups, {
      excludeExtraneousValues: false,
    });
  }

  //Crear un grupo
  async create(createGroupDto: CreateGroupDto): Promise<GroupResponseDto> {
    // 1. Verificar usuario creador
    const user = await this.userRepository.findOne({
      where: { id: createGroupDto.createdById },
      select: ['id', 'email', 'firstName', 'lastName'],
    });

    if (!user) {
      throw new NotFoundException('Usuario creador no encontrado');
    }

    // 2. Crear el grupo
    const newGroup = this.groupRepository.create(createGroupDto);
    const group = await this.groupRepository.save(newGroup);

    // 3. Crear roles por defecto para este grupo
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

    const adminRole = await this.groupRoleRepository.save(
      this.groupRoleRepository.create({
        name: 'ADMIN',
        description: 'Administrador del grupo',
        isDefault: false,
        level: ROLE_LEVELS.ADMIN,
        isSystem: true,
        group,
      }),
    );

    const memberRole = await this.groupRoleRepository.save(
      this.groupRoleRepository.create({
        name: 'MEMBER',
        description: 'Miembro del grupo',
        isDefault: true,
        level: ROLE_LEVELS.MEMBER,
        isSystem: true,
        group,
      }),
    );

    // 4. Crear relación UserGroup
    const userGroup = await this.userGroupRepository.save(
      this.userGroupRepository.create({
        user,
        group,
        isCreator: true,
        groupRole: ownerRole,
      }),
    );

    return this.getById(group.id);
  }

  //Agregar un miembro
  async addMember(
    groupId: string,
    userId: string,
    assignedByUserId: string,
  ): Promise<GroupResponseDto> {
    const [group, user, assignedByUser] = await Promise.all([
      this.groupRepository.findOne({ where: { id: groupId } }),
      this.userRepository.findOne({ where: { id: userId } }),
      this.userRepository.findOne({ where: { id: assignedByUserId } }),
    ]);

    if (!group) throw new NotFoundException('Group not found');
    if (!user) throw new NotFoundException('User to add not found');
    if (!assignedByUser)
      throw new NotFoundException('Assigning user not found');

    // Verificar si el usuario ya es miembro
    const existingUserGroup = await this.userGroupRepository.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });

    if (existingUserGroup) {
      throw new NotFoundException('User is already a member of the group');
    }

    // Obtener rol de miembro por defecto
    const memberRole = await this.groupRoleRepository.findOne({
      where: {
        group: { id: groupId },
        name: 'MEMBER',
      },
    });

    if (!memberRole)
      throw new NotFoundException('Default member role not found for group');

    // Crear UserGroup
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
  //Asignar un rol
  async assignRole(
    groupId: string,
    userId: string,
    roleId: string,
    assignedByUserId: string,
  ): Promise<GroupResponseDto> {
    const [userGroup, role, assignedByUser] = await Promise.all([
      this.userGroupRepository.findOne({
        where: { group: { id: groupId }, user: { id: userId } },
        relations: ['user', 'group'],
      }),
      this.groupRoleRepository.findOne({
        where: { id: roleId, group: { id: groupId } },
      }),
      this.userRepository.findOne({ where: { id: assignedByUserId } }),
    ]);

    if (!userGroup)
      throw new NotFoundException('User is not member of this group');
    if (!role) throw new NotFoundException('Role not found');
    if (role.group.id !== groupId)
      throw new NotFoundException('Role does not belong to this group'); // Assuming role.group is lazy loaded or check needed? relations needed for role?

    if (!assignedByUser)
      throw new NotFoundException('Assigning user not found');

    // Verificación de jerarquía
    const requesterUserGroup = await this.userGroupRepository.findOne({
        where: { group: { id: groupId }, user: { id: assignedByUserId } },
        relations: ['groupRole'],
    });

    if (!requesterUserGroup) {
        throw new ForbiddenException('Requester is not a member of this group');
    }

    if (requesterUserGroup.groupRole.level <= role.level) {
        throw new ForbiddenException('Cannot assign a role with equal or higher authority than yours');
    }

    // Proteger al último Owner
    if (userGroup.groupRole.level === ROLE_LEVELS.OWNER && role.level !== ROLE_LEVELS.OWNER) {
      const ownerCount = await this.userGroupRepository.count({
        where: {
          group: { id: groupId },
          groupRole: { level: ROLE_LEVELS.OWNER },
        },
      });
      if (ownerCount <= 1) {
        throw new ForbiddenException(
          'Cannot remove the last owner from the group. Assign another owner first.',
        );
      }
    }

    // Asignar nuevo rol
    userGroup.groupRole = role;
    await this.userGroupRepository.save(userGroup);

    return this.getById(groupId);
  }
}

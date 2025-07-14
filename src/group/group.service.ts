import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UserGroup } from './entities/user-group.entity';
import { User } from '../user/entities/user.entity';
import { GroupResponseDto } from './dto/group-response.dto';
import { Role } from '../role/entity/role.entity';
import { UserGroupRole } from './entities/user-group-role.entity';
import { IPermissions } from 'src/types/types';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(UserGroupRole)
    private readonly userGroupRoleRepository: Repository<UserGroupRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getById(id: string): Promise<GroupResponseDto> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: [
        'userGroups', 
        'userGroups.user', 
        'userGroups.userGroupRoles',
        'userGroups.userGroupRoles.role'
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
        'userGroups.userGroupRoles',
        'userGroups.userGroupRoles.role'
      ],
    });

    return plainToInstance(GroupResponseDto, groups, {
      excludeExtraneousValues: false,
    });
  }

async create(createGroupDto: CreateGroupDto): Promise<GroupResponseDto> {
  // 1. Verificar usuario creador
  const user = await this.userRepository.findOne({ 
    where: { id: createGroupDto.createdById },
    select: ['id', 'email', 'firstName', 'lastName'] 
  });
  
  if (!user) {
    throw new NotFoundException('Usuario creador no encontrado');
  }

  // 2. Crear el grupo
  const newGroup = this.groupRepository.create(createGroupDto);
  const group = await this.groupRepository.save(newGroup);

  // 3. Obtener o crear roles globales (modificación clave)
  const [adminRole, memberRole] = await Promise.all([
    this.getOrCreateGlobalRole(
      'Administrador',
      'Rol de administrador del grupo',
      { canManageGroup: true, canInvite: true },
      user
    ),
    this.getOrCreateGlobalRole(
      'Miembro',
      'Rol básico de miembro',
      { canView: true },
      user
    )
  ]);

  // 4. Crear relación UserGroup
  const userGroup = await this.userGroupRepository.save(
    this.userGroupRepository.create({
      user,
      group,
      isCreator: true
    })
  );

  // 5. Asignar rol de administrador al creador
  await this.userGroupRoleRepository.save(
    this.userGroupRoleRepository.create({
      userGroup,
      role: adminRole,
      assignedBy: user
    })
  );

  return this.getById(group.id);
}

private async getOrCreateGlobalRole(
  name: string,
  description: string,
  permissions: IPermissions,
  createdBy: User
): Promise<Role> {
  // Primero intenta encontrar el rol global existente
  const existingRole = await this.roleRepository.findOne({
    where: { name, isGlobal: true }
  });

  if (existingRole) {
    return existingRole;
  }

  // Si no existe, crea uno nuevo
  return this.roleRepository.save(
    this.roleRepository.create({
      name,
      description,
      permissions,
      createdBy,
      isGlobal: true // Marca como rol global
    })
  );
}


  async addMember(groupId: string, userId: string, assignedByUserId: string): Promise<GroupResponseDto> {
    const [group, user, assignedByUser] = await Promise.all([
      this.groupRepository.findOne({ where: { id: groupId } }),
      this.userRepository.findOne({ where: { id: userId } }),
      this.userRepository.findOne({ where: { id: assignedByUserId } })
    ]);

    if (!group) throw new NotFoundException('Group not found');
    if (!user) throw new NotFoundException('User to add not found');
    if (!assignedByUser) throw new NotFoundException('Assigning user not found');

    // Verificar si el usuario ya es miembro
    const existingUserGroup = await this.userGroupRepository.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });

    if (existingUserGroup) {
      throw new NotFoundException('User is already a member of the group');
    }

    // Obtener rol de miembro por defecto
    const memberRole = await this.roleRepository.findOne({
      where: {
        name: 'Miembro',
        createdBy: { id: assignedByUserId }
      },
    });

    if (!memberRole) throw new NotFoundException('Default member role not found');

    // Crear UserGroup
    const userGroup = await this.userGroupRepository.save(
      this.userGroupRepository.create({
        user,
        group,
        isCreator: false
      })
    );

    // Asignar rol
    await this.userGroupRoleRepository.save(
      this.userGroupRoleRepository.create({
        userGroup,
        role: memberRole,
        assignedBy: assignedByUser
      })
    );

    return this.getById(groupId);
  }

  async assignRole(
    groupId: string,
    userId: string,
    roleId: string,
    assignedByUserId: string
  ): Promise<GroupResponseDto> {
    const [userGroup, role, assignedByUser] = await Promise.all([
      this.userGroupRepository.findOne({
        where: { group: { id: groupId }, user: { id: userId } },
        relations: ['user', 'group']
      }),
      this.roleRepository.findOne({ where: { id: roleId } }),
      this.userRepository.findOne({ where: { id: assignedByUserId } })
    ]);

    if (!userGroup) throw new NotFoundException('User is not member of this group');
    if (!role) throw new NotFoundException('Role not found');
    if (!assignedByUser) throw new NotFoundException('Assigning user not found');

    // Verificar si el usuario ya tiene este rol
    const existingAssignment = await this.userGroupRoleRepository.findOne({
      where: { userGroup: { id: userGroup.id }, role: { id: roleId } }
    });

    if (existingAssignment) {
      throw new NotFoundException('User already has this role in the group');
    }

    // Asignar nuevo rol
    await this.userGroupRoleRepository.save(
      this.userGroupRoleRepository.create({
        userGroup,
        role,
        assignedBy: assignedByUser
      })
    );

    return this.getById(groupId);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer'; // Usa plainToInstance en vez de plainToClass (más nuevo)

import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UserGroup } from './entities/user-group.entity';
import { User } from '../user/entities/user.entity';
import { GroupResponseDto } from './dto/group-response.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Método para obtener grupo por ID con DTO
  async getById(id: string): Promise<GroupResponseDto> {
    // Primero obtenemos el grupo con sus relaciones
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['userGroups', 'userGroups.user', 'userGroups.group'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Transformamos el objeto a GroupResponseDto
    return plainToInstance(GroupResponseDto, group, {
      excludeExtraneousValues: false, // Cambia a true si estás usando @Expose()
    });
  }

  // Método para obtener todos los grupos con DTO
  async getAll(): Promise<GroupResponseDto[]> {
    const groups = await this.groupRepository.find({
      relations: ['userGroups', 'userGroups.user', 'userGroups.group'],
    });

    return plainToInstance(GroupResponseDto, groups, {
      excludeExtraneousValues: false, // Cambia a true si estás usando @Expose()
    });
  }

  // Crear grupo
  async create(createGroupDto: CreateGroupDto, userId: string): Promise<GroupResponseDto> {
    const newGroup = this.groupRepository.create(createGroupDto);
    const group = await this.groupRepository.save(newGroup);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const userGroup = this.userGroupRepository.create({
      user: { id: userId },
      group: group,
      isCreator: true, 
      role: 'member', 
    });
    await this.userGroupRepository.save(userGroup);

    // Retornamos el grupo creado usando el DTO
    return this.getById(group.id);
  }

  // Agregar miembro al grupo
  async addMember(groupId: string, userId: string): Promise<GroupResponseDto> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Verificar si el usuario ya pertenece al grupo
    const existingUserGroup = await this.userGroupRepository.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });

    if (existingUserGroup) {
      throw new NotFoundException('User is already a member of the group');
    }

    // Si no existe, asignamos al nuevo miembro
    const userGroup = this.userGroupRepository.create({
      user: { id: userId },
      group: { id: groupId },
      role: 'member',
      isCreator: false,
    });

    await this.userGroupRepository.save(userGroup);

    // Retornamos el grupo actualizado usando el DTO
    return this.getById(groupId);
  }

  

}
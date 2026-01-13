import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from './entity/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Group } from 'src/group/group/entities/group.entity';
import { UserGroup } from 'src/group/user-group/entities/user-group.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async createRole(role: CreateRoleDto): Promise<Role> {
    const newRole = this.roleRepository.create(role);
    return this.roleRepository.save(newRole);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }
  /** 
        async updateRole(id: string, role: CreateRoleDto): Promise<Role> {
            const existingRole = await this.getRoleById(id);
            Object.assign(existingRole, role);
            return this.roleRepository.save(existingRole);
        }
    */
}

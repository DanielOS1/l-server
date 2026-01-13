import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Crear un rol
  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }
  
  // Obtener todos los roles
  @Get('all')
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }

  // Obtener un rol por ID
  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    return this.roleService.getRoleById(id);
  }
}

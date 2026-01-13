import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupRoleService } from './group-role.service';
import { CreateGroupRoleDto } from './dto/create-group-role.dto';
import { UpdateGroupRoleDto } from './dto/update-group-role.dto';

@Controller('group-roles')
export class GroupRoleController {
  constructor(private readonly groupRoleService: GroupRoleService) {}

  @Post()
  create(@Body() createGroupRoleDto: CreateGroupRoleDto) {
    return this.groupRoleService.create(createGroupRoleDto);
  }

  @Get()
  findAll() {
    return this.groupRoleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupRoleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupRoleDto: UpdateGroupRoleDto,
  ) {
    return this.groupRoleService.update(id, updateGroupRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupRoleService.remove(id);
  }
}

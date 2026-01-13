import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { GroupRoleService } from './group-role.service';
import { CreateGroupRoleDto } from './dto/create-group-role.dto';
import { UpdateGroupRoleDto } from './dto/update-group-role.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('group-roles')
@UseGuards(AuthGuard('jwt'))
export class GroupRoleController {
  constructor(private readonly groupRoleService: GroupRoleService) {}

  @Post()
  create(@Request() req, @Body() createGroupRoleDto: CreateGroupRoleDto) {
    return this.groupRoleService.create(req.user.userId, createGroupRoleDto);
  }

  @Get()
  findAll(@Request() req, @Query('groupId') groupId: string) {
    return this.groupRoleService.findAll(groupId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupRoleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateGroupRoleDto: UpdateGroupRoleDto,
  ) {
    return this.groupRoleService.update(
      req.user.userId,
      id,
      updateGroupRoleDto,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.groupRoleService.remove(req.user.userId, id);
  }
}

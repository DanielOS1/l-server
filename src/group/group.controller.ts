import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // Crear un grupo
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createGroupDto: CreateGroupDto, 
    @Query('userId') userId: string
  ): Promise<GroupResponseDto> {
    return this.groupService.create(createGroupDto, userId);
  }

  // Obtener un grupo por ID
  @Get(':id')
  getById(@Param('id') id: string): Promise<GroupResponseDto> {
    return this.groupService.getById(id);
  }

  // Obtener todos los grupos
  @Get()
  getAll(): Promise<GroupResponseDto[]> {
    return this.groupService.getAll();
  }

  // Agregar miembro a un grupo
  @Post(':groupId/add-member')
  @HttpCode(HttpStatus.OK)
  addMember(
    @Param('groupId') groupId: string, 
    @Query('userId') userId: string
  ): Promise<GroupResponseDto> {
    return this.groupService.addMember(groupId, userId);
  }
}
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';

@Controller('groups')
@UseGuards(AuthGuard('jwt'))
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req,
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupService.create(req.user.userId, createGroupDto);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<GroupResponseDto> {
    return this.groupService.getById(id);
  }

  @Get()
  getAll(): Promise<GroupResponseDto[]> {
    return this.groupService.getAll();
  }

  @Get('user/:userId')
  getByUserId(@Param('userId') userId: string): Promise<GroupResponseDto[]> {
    return this.groupService.getByUserId(userId);
  }

  @Post(':groupId/add-member')
  @HttpCode(HttpStatus.OK)
  addMember(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body('userId') userId: string,
  ): Promise<GroupResponseDto> {
    return this.groupService.addMember(groupId, userId, req.user.userId);
  }

  @Post(':groupId/assign-role')
  @HttpCode(HttpStatus.OK)
  assignRole(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body('userId') userId: string,
    @Body('roleId') roleId: string,
  ): Promise<GroupResponseDto> {
    return this.groupService.assignRole(groupId, userId, roleId, req.user.userId);
  }

  @Delete(':groupId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Request() req,
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.groupService.removeMember(groupId, userId, req.user.userId);
  }
}

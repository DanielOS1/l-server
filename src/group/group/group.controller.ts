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
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
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
    @Request() req: AuthenticatedRequest,
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupService.create(req.user.userId, createGroupDto);
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GroupResponseDto> {
    return this.groupService.getById(id, req.user.userId);
  }

  @Get()
  getAll(@Request() req: AuthenticatedRequest): Promise<GroupResponseDto[]> {
    return this.groupService.getByUserId(req.user.userId);
  }

  @Get('user/:userId')
  getByUserId(
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GroupResponseDto[]> {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('No puedes ver los grupos de otro usuario');
    }
    return this.groupService.getByUserId(userId);
  }

  @Post(':groupId/add-member')
  @HttpCode(HttpStatus.OK)
  addMember(
    @Request() req: AuthenticatedRequest,
    @Param('groupId') groupId: string,
    @Body('userId') userId: string,
  ): Promise<GroupResponseDto> {
    return this.groupService.addMember(groupId, userId, req.user.userId);
  }

  @Post(':groupId/assign-role')
  @HttpCode(HttpStatus.OK)
  assignRole(
    @Request() req: AuthenticatedRequest,
    @Param('groupId') groupId: string,
    @Body('userId') userId: string,
    @Body('roleId') roleId: string,
  ): Promise<GroupResponseDto> {
    return this.groupService.assignRole(
      groupId,
      userId,
      roleId,
      req.user.userId,
    );
  }

  @Delete(':groupId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Request() req: AuthenticatedRequest,
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.groupService.removeMember(groupId, userId, req.user.userId);
  }
}

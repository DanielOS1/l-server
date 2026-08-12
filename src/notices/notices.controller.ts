import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Controller('notices')
@UseGuards(AuthGuard('jwt'))
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateNoticeDto) {
    return this.noticesService.create(dto, req.user.userId);
  }

  @Get('group/:groupId')
  findForMembers(@Param('groupId') groupId: string) {
    return this.noticesService.findForMembers(groupId);
  }

  @Get('group/:groupId/admin')
  findForAdmin(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.noticesService.findForAdmin(groupId, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNoticeDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.noticesService.update(id, dto, req.user.userId);
  }

  @Patch(':id/send')
  @HttpCode(HttpStatus.OK)
  send(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.noticesService.send(id, req.user.userId);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.noticesService.deactivate(id, req.user.userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Request,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Position } from './entities/position.entity';

@Controller('position')
@UseGuards(AuthGuard('jwt'))
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  create(
    @Body() createPositionDto: CreatePositionDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Position> {
    return this.positionService.create(createPositionDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('semesterId') semesterId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Position[]> {
    if (!semesterId) {
      throw new BadRequestException('semesterId is required');
    }
    return this.positionService.findAllBySemester(semesterId, req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Position> {
    return this.positionService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Position> {
    return this.positionService.update(id, updatePositionDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.positionService.remove(id, req.user.userId);
  }
}

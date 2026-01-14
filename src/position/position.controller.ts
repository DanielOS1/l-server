import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Position } from './entities/position.entity';

@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  create(@Body() createPositionDto: CreatePositionDto): Promise<Position> {
    return this.positionService.create(createPositionDto);
  }

  @Get()
  findAll(@Query('semesterId') semesterId: string): Promise<Position[]> {
    if (!semesterId) {
      throw new BadRequestException('semesterId is required');
    }
    return this.positionService.findAllBySemester(semesterId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Position> {
    return this.positionService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ): Promise<Position> {
    return this.positionService.update(id, updatePositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.positionService.remove(id);
  }
}

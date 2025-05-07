import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly usuarioService: UserService) {}

  @Post()
  crear(@Body() data: CreateUserDto): Promise<User> {
    return this.usuarioService.create(data);
  }

  @Get()
  obtenerTodos(): Promise<User[]> {
    return this.usuarioService.getAll();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string): Promise<User> {
    return this.usuarioService.getById(id);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<User> {
    return this.usuarioService.update(id, data);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string): Promise<void> {
    return this.usuarioService.delete(id);
  }
}

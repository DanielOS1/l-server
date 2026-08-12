import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Request,
  NotFoundException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly usuarioService: UserService) {}

  private assertSelf(req: AuthenticatedRequest, id: string): void {
    if (req.user.userId !== id) {
      throw new ForbiddenException('No puedes acceder a datos de otro usuario');
    }
  }

  @Get('search')
  async buscarPorEmail(@Query('email') email: string): Promise<User> {
    const user = await this.usuarioService.findByEmail(email);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  @Get(':id')
  obtenerPorId(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<User> {
    this.assertSelf(req, id);
    return this.usuarioService.getById(id);
  }

  @Put(':id')
  actualizar(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<User> {
    this.assertSelf(req, id);
    return this.usuarioService.update(id, data);
  }

  @Delete(':id')
  eliminar(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    this.assertSelf(req, id);
    return this.usuarioService.delete(id);
  }
}

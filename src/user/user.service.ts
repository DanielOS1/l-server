import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.getById(id);
    const { password, ...rest } = data;
    Object.assign(user, rest);
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.getById(id);
    await this.userRepository.remove(user);
  }
}

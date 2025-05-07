import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { User } from '../user/entities/user.entity';
import { UserGroup } from './entities/user-group.entity';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { UserModule } from '../user/user.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, User, UserGroup]),
    UserModule,  
  ],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}

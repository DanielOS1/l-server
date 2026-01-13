import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupRoleService } from './group-role.service';
import { GroupRoleController } from './group-role.controller';
import { GroupRole } from './entities/group-role.entity';
import { Group } from '../group/entities/group.entity';

import { UserGroup } from '../user-group/entities/user-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupRole, Group, UserGroup])],
  controllers: [GroupRoleController],
  providers: [GroupRoleService],
  exports: [GroupRoleService],
})
export class GroupRoleModule {}

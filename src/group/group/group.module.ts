import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { UserGroup } from '../user-group/entities/user-group.entity';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { UserModule } from '../../user/user.module';
import { RoleModule } from '../../system/role/role.module';
import { GroupRole } from '../group-role/entities/group-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, UserGroup, GroupRole]),
    UserModule,
    RoleModule,
  ],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [TypeOrmModule], // Exporta TypeOrmModule si otros módulos necesitan estos repositorios
})
export class GroupModule {}

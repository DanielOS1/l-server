import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { UserGroup } from './entities/user-group.entity';
import { UserGroupRole } from './entities/user-group-role.entity';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module'; // Asegúrate de importar RoleModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, UserGroup, UserGroupRole]),
    UserModule,
    RoleModule, // Esto es crucial
  ],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [TypeOrmModule], // Exporta TypeOrmModule si otros módulos necesitan estos repositorios
})
export class GroupModule {}
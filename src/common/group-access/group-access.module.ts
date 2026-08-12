import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroup } from 'src/group/user-group/entities/user-group.entity';
import { GroupAccessService } from './group-access.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserGroup])],
  providers: [GroupAccessService],
  exports: [GroupAccessService],
})
export class GroupAccessModule {}

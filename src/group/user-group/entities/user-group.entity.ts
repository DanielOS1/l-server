import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
} from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { Group } from '../../group/entities/group.entity';
import { GroupRole } from 'src/group/group-role/entities/group-role.entity';

@Entity('user_groups')
export class UserGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userGroups, { eager: true })
  user: User;

  @ManyToOne(() => Group, (group) => group.userGroups, { eager: true })
  group: Group;

  @Column({ default: false })
  isCreator: boolean;

  @ManyToOne(() => GroupRole, { nullable: true })
  groupRole: GroupRole;
}

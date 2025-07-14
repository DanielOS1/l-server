import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Group } from './group.entity';
import { Role } from 'src/role/entity/role.entity';
import { UserGroupRole } from './user-group-role.entity';

@Entity('user_groups')
export class UserGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.userGroups, { eager: true })
  user: User;

  @ManyToOne(() => Group, group => group.userGroups, { eager: true })
  group: Group;

  @ManyToOne(() => Role, { nullable: true })
  role: Role; 

  @OneToMany(() => UserGroupRole, userGroupRole => userGroupRole.userGroup)
  userGroupRoles: UserGroupRole[];

  @Column({ default: false })
  isCreator: boolean;
}

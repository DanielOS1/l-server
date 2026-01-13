import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { UserGroup } from '../../user-group/entities/user-group.entity';
import { Role } from '../../../system/role/entity/role.entity';
import { GroupRole } from 'src/group/group-role/entities/group-role.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  extraData: any;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => GroupRole, { nullable: true })
  groupRole: GroupRole;

  @OneToMany(() => UserGroup, (userGroup) => userGroup.group)
  userGroups: UserGroup[];
}

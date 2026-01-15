import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../group/entities/group.entity';
import { UserGroup } from '../../user-group/entities/user-group.entity';

@Entity('group_roles')
export class GroupRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => Group, (group) => group.roles, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @OneToMany(() => UserGroup, (userGroup) => userGroup.groupRole)
  userGroups: UserGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

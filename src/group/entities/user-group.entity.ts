import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Group } from './group.entity';

@Entity('user_groups')
export class UserGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.userGroups, { eager: true })
  user: User;

  @ManyToOne(() => Group, group => group.userGroups, { eager: true })
  group: Group;

  @Column({ length: 50 })
  role: string; 

  @Column({ default: false })
  isCreator: boolean;
}

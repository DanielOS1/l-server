import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from 'typeorm';
import { UserGroup } from './user-group.entity';
import { Role } from '../../role/entity/role.entity';
import { User } from '../../user/entities/user.entity';

@Entity('user_group_roles')
export class UserGroupRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserGroup, userGroup => userGroup.userGroupRoles, { onDelete: 'CASCADE' })
  userGroup: UserGroup;

  @ManyToOne(() => Role, role => role.userGroupRoles)
  role: Role;

  @ManyToOne(() => User)
  assignedBy: User; // Quién asignó este rol

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // Para roles temporales

  @CreateDateColumn()
  assignedAt: Date;
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { UserGroupRole } from './../../group/entities/user-group-role.entity';
import { IPermissions } from '../../types/types'; 

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 , unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: IPermissions;

  @ManyToOne(() => User, (user: User) => user.createdRoles)
  createdBy: User;

  @Column({ default: false })
  isSystemRole: boolean;

  @OneToMany(() => UserGroupRole, (userGroupRole: UserGroupRole) => userGroupRole.role)
  userGroupRoles: UserGroupRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({default: true})
  isGlobal: boolean;
}
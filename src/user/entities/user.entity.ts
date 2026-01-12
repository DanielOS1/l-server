import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserGroup } from 'src/group/entities/user-group.entity';
import { Role } from 'src/role/entity/role.entity';
import { Assignment } from 'src/assignment/entities/assignment.entity';


@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 20, unique: true })
  rut: string;

  @Column({ length: 100, nullable: true })
  occupation: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 200, nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ length: 100, unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => UserGroup, userGroup => userGroup.user)
  userGroups: UserGroup[];

  @OneToMany(() => Role, role => role.createdBy)
  createdRoles: Role[]; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Assignment, assignment => assignment.user)
  assignments: Assignment[];

}
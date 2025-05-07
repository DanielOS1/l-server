import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserGroup } from 'src/group/entities/user-group.entity';
//import { Rol } from './rol.entity';
//import { AsignacionActividad } from './asignacion-actividad.entity';
//import { PagoAporte } from './pago-aporte.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 20, unique: true })
  rut: string;

  @Column({ length: 100, nullable: true })
  ocupacion: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 200, nullable: true })
  direccion: string;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento: Date;

  @Column({ length: 100, unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;
/**
  @ManyToOne(() => Rol, rol => rol.usuarios)
  rol: Rol;

  @OneToMany(() => AsignacionActividad, asignacion => asignacion.usuario)
  asignaciones: AsignacionActividad[];

  @OneToMany(() => PagoAporte, pago => pago.usuario)
  pagos: PagoAporte[];
 */

  @OneToMany(() => UserGroup, userGroup => userGroup.user)
  userGroups: UserGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
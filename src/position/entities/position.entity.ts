import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Semester } from '../../semester/entities/semester.entity';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Semester, semester => semester.positions)
  semester: Semester;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Semester } from 'src/group/semester/entities/semester.entity';
import { Assignment } from 'src/assignment/entities/assignment.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 200 })
  location: string;

  @ManyToOne(() => Semester, (semester) => semester.activities)
  semester: Semester;

  @OneToMany(() => Assignment, (assignment) => assignment.activity)
  assignments: Assignment[];
}

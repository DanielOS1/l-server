import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Semester } from 'src/group/semester/entities/semester.entity';
import { ActivityPosition } from '../../activity/entities/activity-position.entity';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Semester, (semester) => semester.positions)
  semester: Semester;

  @OneToMany(() => ActivityPosition, (ap) => ap.position)
  activityPositions: ActivityPosition[];
}

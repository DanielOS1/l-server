import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Activity } from '../../activity/entities/activity.entity';
import { Position } from '../../position/entities/position.entity';
import { User } from '../../user/entities/user.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Activity, activity => activity.assignments)
  activity: Activity;

  @ManyToOne(() => Position)
  position: Position;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
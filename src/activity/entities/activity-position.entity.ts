import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Activity } from './activity.entity';
import { Position } from '../../position/entities/position.entity';

@Entity('activity_positions')
export class ActivityPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Activity, (activity) => activity.activityPositions, {
    onDelete: 'CASCADE',
  })
  activity: Activity;

  @ManyToOne(() => Position, (position) => position.activityPositions)
  position: Position;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}

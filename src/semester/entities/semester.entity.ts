import { Activity } from 'src/activity/entities/activity.entity';
import { Position } from 'src/position/entities/position.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('semester')
export class Semester {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => Position, position => position.semester)
    positions: Position[];

    @OneToMany(() => Activity, activity => activity.semester)
    activities: Activity[];
}
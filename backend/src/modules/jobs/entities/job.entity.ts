import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobApplication } from './job-application.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array', { nullable: true })
  requiredSkills: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string; // full-time, part-time, remote

  @Column({ type: 'int', nullable: true })
  minExperienceYears: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column('uuid')
  postedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  postedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => JobApplication, (a) => a.job)
  applications: JobApplication[];
}

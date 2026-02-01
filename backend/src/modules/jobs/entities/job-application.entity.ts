import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from './job.entity';

export enum ApplicationStatus {
  Pending = 'pending',
  Shortlisted = 'shortlisted',
  Rejected = 'rejected',
  Hired = 'hired',
}

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  jobId: string;

  @ManyToOne(() => Job, (j) => j.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column('uuid')
  candidateId: string;

  @ManyToOne(() => User, (u) => u.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidateId' })
  candidate: User;

  @Column({ type: 'varchar', length: 50, default: ApplicationStatus.Pending })
  status: ApplicationStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  matchScore: number | null;

  @CreateDateColumn()
  appliedAt: Date;
}

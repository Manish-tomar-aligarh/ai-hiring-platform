import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  candidateId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidateId' })
  candidate: User;

  @Column('uuid', { nullable: true })
  jobId: string | null;

  @ManyToOne(() => Job, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'jobId' })
  job: Job | null;

  @Column({ default: 'scheduled' })
  status: string; // scheduled | in_progress | completed | cancelled

  @Column('simple-json', { nullable: true })
  questions: Array<{ question: string; expectedTopics?: string[] }>;

  @Column('simple-json', { nullable: true })
  responses: Array<{
    questionIndex: number;
    transcript?: string;
    sentimentScore?: number;
    relevanceScore?: number;
  }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore: number | null;

  @Column({ type: 'date', nullable: true })
  completedAt: Date | null;

  @Column('text', { nullable: true })
  feedback: string | null;

  @Column({ type: 'text', nullable: true })
  videoUrl: string | null;

  @CreateDateColumn()
  scheduledAt: Date;
}

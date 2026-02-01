import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Resume } from './resume.entity';

@Entity('resume_analyses')
export class ResumeAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  resumeId: string;

  @OneToOne(() => Resume, (r) => r.analysis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resumeId' })
  resume: Resume;

  @Column('simple-array', { default: '' })
  skills: string[];

  @Column('simple-json', { nullable: true })
  experience: Array<{ company: string; role: string; years?: number }>;

  @Column('simple-json', { nullable: true })
  projects: Array<{ name: string; description?: string; tech?: string[] }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  credibilityScore: number | null;

  @CreateDateColumn()
  createdAt: Date;
}

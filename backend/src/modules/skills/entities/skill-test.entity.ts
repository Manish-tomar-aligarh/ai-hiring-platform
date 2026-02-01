import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SkillTestAttempt } from './skill-test-attempt.entity';

@Entity('skill_tests')
export class SkillTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('simple-array')
  skillTags: string[];

  @Column({ type: 'varchar', length: 20, default: 'mcq' })
  type: string; // mcq | coding

  @Column({ type: 'simple-json', nullable: true })
  questions: Array<{
    question: string;
    options?: string[];
    correctAnswer?: string;
    codeTemplate?: string;
    language?: string;
  }>;

  @Column({ type: 'int', default: 30 })
  durationMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SkillTestAttempt, (a) => a.skillTest)
  attempts: SkillTestAttempt[];
}

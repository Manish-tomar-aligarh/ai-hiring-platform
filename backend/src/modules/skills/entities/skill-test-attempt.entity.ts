import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SkillTest } from './skill-test.entity';

@Entity('skill_test_attempts')
export class SkillTestAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  skillTestId: string;

  @ManyToOne(() => SkillTest, (t) => t.attempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skillTestId' })
  skillTest: SkillTest;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number | null;

  @Column({ type: 'int', nullable: true })
  correctCount: number | null;

  @Column({ default: 'in_progress' })
  status: string; // in_progress | completed

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  startedAt: Date;
}

import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillTest } from './entities/skill-test.entity';
import { SkillTestAttempt } from './entities/skill-test-attempt.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SkillsService implements OnModuleInit {
  constructor(
    @InjectRepository(SkillTest)
    private testRepo: Repository<SkillTest>,
    @InjectRepository(SkillTestAttempt)
    private attemptRepo: Repository<SkillTestAttempt>,
    private aiService: AiService,
  ) {}

  async onModuleInit() {
    const count = await this.testRepo.count();
    if (count === 0) {
      await this.testRepo.save(
        this.testRepo.create({
          title: 'Backend & API Fundamentals',
          skillTags: ['JavaScript', 'TypeScript', 'REST API', 'Node.js'],
          type: 'mcq',
          durationMinutes: 15,
          questions: [
            { question: 'What does REST stand for?', options: ['Representational State Transfer', 'Remote Execution State Transfer', 'Resource Endpoint Style Transfer'], correctAnswer: 'Representational State Transfer' },
            { question: 'Which HTTP method is used to create a resource?', options: ['GET', 'POST', 'PUT', 'DELETE'], correctAnswer: 'POST' },
            { question: 'What is TypeScript?', options: ['A framework', 'A superset of JavaScript with types', 'A database'], correctAnswer: 'A superset of JavaScript with types' },
          ],
          isActive: true,
        }),
      );
    }
  }

  async findTests(userId: string, skillTags?: string[]): Promise<SkillTest[]> {
    const qb = this.testRepo
      .createQueryBuilder('t')
      .where('t.isActive = :active', { active: true })
      .andWhere('(t.userId IS NULL OR t.userId = :userId)', { userId })
      .orderBy('t.createdAt', 'DESC');
    if (skillTags?.length) {
      qb.andWhere(':tags && t.skillTags', { tags: skillTags });
    }
    return qb.getMany();
  }

  async createPersonalizedTest(userId: string, skills: string[]): Promise<SkillTest> {
    const questions = await this.aiService.generateSkillQuestions(skills);
    
    // Deactivate previous personalized tests for this user to avoid clutter
    await this.testRepo.update({ userId }, { isActive: false });

    const test = this.testRepo.create({
      title: 'Personalized Skill Assessment',
      skillTags: skills,
      type: 'mcq',
      durationMinutes: 20,
      questions: questions,
      isActive: true,
      userId: userId
    });
    
    return this.testRepo.save(test);
  }

  async findOneTest(id: string): Promise<SkillTest> {
    const test = await this.testRepo.findOne({ where: { id } });
    if (!test) throw new NotFoundException('Skill test not found');
    return test;
  }

  async startAttempt(userId: string, skillTestId: string): Promise<SkillTestAttempt> {
    const test = await this.findOneTest(skillTestId);
    const attempt = this.attemptRepo.create({
      userId,
      skillTestId,
      status: 'in_progress',
    });
    return this.attemptRepo.save(attempt);
  }

  async submitAttempt(
    attemptId: string,
    userId: string,
    answers: Record<number, string>,
  ): Promise<SkillTestAttempt> {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId },
      relations: ['skillTest'],
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId) throw new ForbiddenException('Not your attempt');
    if (attempt.status === 'completed') throw new ForbiddenException('Already submitted');

    const test = attempt.skillTest;
    const questions = (test.questions as Array<{ correctAnswer?: string }>) || [];
    let correct = 0;
    questions.forEach((q, i) => {
      if (q.correctAnswer && answers[i] === q.correctAnswer) correct++;
    });
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;

    attempt.score = score;
    attempt.correctCount = correct;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    return this.attemptRepo.save(attempt);
  }

  async getMyAttempts(userId: string): Promise<SkillTestAttempt[]> {
    return this.attemptRepo.find({
      where: { userId },
      relations: ['skillTest'],
      order: { startedAt: 'DESC' },
    });
  }
}

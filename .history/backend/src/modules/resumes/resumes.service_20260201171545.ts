import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Resume } from './entities/resume.entity';
import { ResumeAnalysis } from './entities/resume-analysis.entity';
import { AiService } from '../ai/ai.service';
import { SkillsService } from '../skills/skills.service'; // ✅ ADD THIS

@Injectable()
export class ResumesService {
  constructor(
    @InjectRepository(Resume)
    private resumeRepo: Repository<Resume>,

    @InjectRepository(ResumeAnalysis)
    private analysisRepo: Repository<ResumeAnalysis>,

    private aiService: AiService,

    private skillsService: SkillsService, // ✅ ADD THIS
  ) {}

  async upload(userId: string, file: Express.Multer.File): Promise<Resume> {
    const resume = this.resumeRepo.create({
      userId,
      fileName: file.originalname,
      filePath: file.path,
      parsingStatus: 'pending',
    });

    const saved = await this.resumeRepo.save(resume);

    // async resume parsing
    this.parseResumeAsync(saved.id, file.path).catch(console.error);

    return saved;
  }

  private async parseResumeAsync(
    resumeId: string,
    filePath: string,
  ): Promise<void> {
    try {
      await this.resumeRepo.update(resumeId, { parsingStatus: 'processing' });

      // 🔥 AI resume parsing
      const result = await this.aiService.parseResume(filePath);

      const analysis = this.analysisRepo.create({
        resumeId,
        skills: result.skills ?? [],
        experience: result.experience ?? [],
        projects: result.projects ?? [],
        credibilityScore: result.credibilityScore ?? null,
      });

      await this.analysisRepo.save(analysis);

      // 🔥 GENERATE PERSONALIZED SKILL TEST
      const resume = await this.resumeRepo.findOne({
        where: { id: resumeId },
      });

      if (resume && result.skills && result.skills.length > 0) {
        await this.skillsService.createPersonalizedTest(
          resume.userId,
          result.skills,
        );
      }

      await this.resumeRepo.update(resumeId, {
        parsingStatus: 'completed',
      });
    } catch (error) {
      console.error('Resume parsing failed:', error);
      await this.resumeRepo.update(resumeId, {
        parsingStatus: 'failed',
      });
      throw error;
    }
  }

  async findByUser(userId: string): Promise<Resume[]> {
    return this.resumeRepo.find({
      where: { userId },
      relations: ['analysis'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Resume> {
    const resume = await this.resumeRepo.findOne({
      where: { id },
      relations: ['analysis'],
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException('Not your resume');
    }

    return resume;
  }
}

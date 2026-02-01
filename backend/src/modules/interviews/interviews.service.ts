import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './entities/interview.entity';
import { Job } from '../jobs/entities/job.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepo: Repository<Interview>,
    @InjectRepository(Job)
    private jobRepo: Repository<Job>,
    private aiService: AiService,
  ) {}

  async schedule(candidateId: string, jobId: string | null): Promise<Interview> {
    const questions: string[] = jobId
      ? await this.aiService.generateInterviewQuestions('Role', 'Job description')
      : [
          'Tell us about yourself.',
          'What are your strengths?',
          'Describe a challenging situation you faced and how you handled it.',
          'Where do you see yourself in 5 years?',
          'Why do you want to work with us?',
        ];
    const interview = this.interviewRepo.create({
      candidateId,
      jobId,
      status: 'scheduled',
      questions: questions.map((q) => ({ question: q })),
      scheduledAt: new Date(),
    });
    return this.interviewRepo.save(interview);
  }

  async findMyInterviews(candidateId: string): Promise<Interview[]> {
    return this.interviewRepo.find({
      where: { candidateId },
      relations: ['job'],
      order: { scheduledAt: 'DESC' },
    });
  }

  async findAllInterviews(): Promise<Interview[]> {
    return this.interviewRepo.find({
      relations: ['job', 'candidate'],
      order: { scheduledAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string, role?: string): Promise<Interview> {
    const interview = await this.interviewRepo.findOne({
      where: { id },
      relations: ['job', 'candidate'],
    });
    if (!interview) throw new NotFoundException('Interview not found');
    
    // Allow if user is owner OR if user is recruiter/admin
    const isOwner = interview.candidateId === userId;
    const isRecruiter = role === 'recruiter' || role === 'admin';

    if (!isOwner && !isRecruiter) {
      throw new ForbiddenException('Not your interview');
    }
    return interview;
  }

  async submitResponse(
    interviewId: string,
    userId: string,
    questionIndex: number,
    transcript: string,
  ): Promise<Interview> {
    const interview = await this.findOne(interviewId, userId);
    const scores = await this.aiService.scoreInterviewResponse(
      (interview.questions as Array<{ question: string }>)?.[questionIndex]?.question ?? '',
      transcript,
    );
    type ResponseItem = { questionIndex: number; transcript?: string; sentimentScore?: number; relevanceScore?: number };
    const responses: ResponseItem[] = (interview.responses as ResponseItem[] | null) ?? [];
    responses[questionIndex] = {
      questionIndex,
      transcript,
      relevanceScore: scores.relevanceScore,
      sentimentScore: scores.sentimentScore,
    };
    interview.responses = responses;
    return this.interviewRepo.save(interview);
  }

  async completeInterview(interviewId: string, userId: string, videoUrl?: string): Promise<Interview> {
    const interview = await this.findOne(interviewId, userId);
    const responses = (interview.responses as Array<{ relevanceScore?: number }>) ?? [];
    const avg =
      responses.length > 0
        ? responses.reduce((s, r) => s + (r.relevanceScore ?? 0), 0) / responses.length
        : 0;
    interview.overallScore = Math.round(avg);
    interview.status = 'completed';
    interview.completedAt = new Date();
    if (videoUrl) {
      interview.videoUrl = videoUrl;
    }
    return this.interviewRepo.save(interview);
  }
}

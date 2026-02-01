import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobApplication, ApplicationStatus } from './entities/job-application.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Role } from '../../common/enums/roles.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepo: Repository<Job>,
    @InjectRepository(JobApplication)
    private applicationRepo: Repository<JobApplication>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(postedById: string, dto: CreateJobDto): Promise<Job> {
    const job = this.jobRepo.create({ ...dto, postedById });
    return this.jobRepo.save(job);
  }

  async findAll(role: string, userId?: string): Promise<Job[]> {
    const qb = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.postedBy', 'postedBy')
      .where('job.isActive = :active', { active: true })
      .orderBy('job.createdAt', 'DESC');
    if (role === Role.Recruiter && userId) {
      qb.andWhere('job.postedById = :userId', { userId });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['postedBy', 'applications'],
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(id: string, userId: string, role: string, dto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);
    if (role !== Role.Admin && job.postedById !== userId)
      throw new ForbiddenException('Not allowed to update this job');
    Object.assign(job, dto);
    return this.jobRepo.save(job);
  }

  async apply(candidateId: string, jobId: string): Promise<JobApplication> {
    const existing = await this.applicationRepo.findOne({
      where: { candidateId, jobId },
    });
    if (existing) throw new ForbiddenException('Already applied');
    const application = this.applicationRepo.create({
      candidateId,
      jobId,
      status: ApplicationStatus.Pending,
    });
    return this.applicationRepo.save(application);
  }

  async getApplicationsForJob(jobId: string, recruiterId: string): Promise<JobApplication[]> {
    const job = await this.findOne(jobId);
    if (job.postedById !== recruiterId) throw new ForbiddenException('Not your job');
    return this.applicationRepo.find({
      where: { jobId },
      relations: ['candidate'],
      order: { appliedAt: 'DESC' },
    });
  }

  async shortlist(applicationId: string, recruiterId: string): Promise<JobApplication> {
    const app = await this.applicationRepo.findOne({
      where: { id: applicationId },
      relations: ['job'],
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.job.postedById !== recruiterId) throw new ForbiddenException('Not your job');
    app.status = ApplicationStatus.Shortlisted;
    return this.applicationRepo.save(app);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Job } from '../jobs/entities/job.entity';
import { Interview } from '../interviews/entities/interview.entity';
import { SkillTest } from '../skills/entities/skill-test.entity';
import { Role } from '../../common/enums/roles.enum';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Interview) private interviewRepo: Repository<Interview>,
    @InjectRepository(SkillTest) private skillTestRepo: Repository<SkillTest>,
  ) {}

  async getStats() {
    const [users, jobs, interviews, tests] = await Promise.all([
      this.userRepo.count(),
      this.jobRepo.count(),
      this.interviewRepo.count(),
      this.skillTestRepo.count(),
    ]);
    
    const candidates = await this.userRepo.count({ where: { role: Role.Candidate } });
    const recruiters = await this.userRepo.count({ where: { role: Role.Recruiter } });

    return {
      totalUsers: users,
      candidates,
      recruiters,
      totalJobs: jobs,
      totalInterviews: interviews,
      totalSkillTests: tests,
    };
  }

  async getAllUsers() {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async deleteUser(id: string) {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async getAllJobs() {
    return this.jobRepo.find({ 
      relations: ['postedBy'],
      order: { createdAt: 'DESC' } 
    });
  }

  async deleteJob(id: string) {
    const result = await this.jobRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Job not found');
    return { message: 'Job deleted successfully' };
  }

  async getAllInterviews() {
    return this.interviewRepo.find({
      relations: ['candidate', 'job'],
      order: { scheduledAt: 'DESC' },
    });
  }

  async deleteInterview(id: string) {
    const result = await this.interviewRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Interview not found');
    return { message: 'Interview deleted successfully' };
  }

  // Setup initial admin if none exists
  async createInitialAdmin(dto: RegisterDto) {
    const adminCount = await this.userRepo.count({ where: { role: Role.Admin } });
    if (adminCount > 0) {
      throw new Error('Admin already exists. Cannot create another via setup.');
    }
    const hashed = await bcrypt.hash(dto.password, 12);
    const admin = this.userRepo.create({
      ...dto,
      password: hashed,
      role: Role.Admin,
    });
    return this.userRepo.save(admin);
  }
}

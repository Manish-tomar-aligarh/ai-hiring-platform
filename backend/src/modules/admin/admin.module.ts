import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Job } from '../jobs/entities/job.entity';
import { Interview } from '../interviews/entities/interview.entity';
import { SkillTest } from '../skills/entities/skill-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Job, Interview, SkillTest])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

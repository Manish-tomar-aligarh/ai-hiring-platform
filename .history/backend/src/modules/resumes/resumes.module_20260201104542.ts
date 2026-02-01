import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { Resume } from './entities/resume.entity';
import { ResumeAnalysis } from './entities/resume-analysis.entity';
import { User } from '../users/entities/user.entity';
import { AiModule } from '../ai/ai.module';
import { SkillsModule } from '../skills/skills.module';

const storage = diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads/resumes',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname) || '.pdf'}`);
  },
});

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, ResumeAnalysis, User]),
    MulterModule.register({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only PDF allowed'), false);
      },
    }),
    AiModule,
    SkillsModule,
  ],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}

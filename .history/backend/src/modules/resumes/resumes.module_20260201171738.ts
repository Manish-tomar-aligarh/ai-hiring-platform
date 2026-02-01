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

// 📂 File storage config
const storage = diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads/resumes',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname) || '.pdf'}`);
  },
});

@Module({
  imports: [
    // 🗄️ Database entities
    TypeOrmModule.forFeature([
      Resume,
      ResumeAnalysis,
      User,
    ]),

    // 📤 Resume upload (PDF only)
    MulterModule.register({
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files are allowed'), false);
        }
      },
    }),

    // 🤖 AI resume parsing
    AiModule,

    // 🧠 Skill test generation
    SkillsModule,
  ],

  controllers: [ResumesController],

  providers: [ResumesService],

  exports: [ResumesService],
})
export class ResumesModule {}

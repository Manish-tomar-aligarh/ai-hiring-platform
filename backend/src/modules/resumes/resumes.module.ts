import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import type { Express } from 'express';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { Resume } from './entities/resume.entity';
import { ResumeAnalysis } from './entities/resume-analysis.entity';
import { User } from '../users/entities/user.entity';
import { AiModule } from '../ai/ai.module';
import { SkillsModule } from '../skills/skills.module';

const uploadPath = process.env.UPLOAD_DIR || './uploads/resumes';

// 🔥 ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = diskStorage({
  destination: uploadPath,
  filename: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, ResumeAnalysis, User]),
    MulterModule.register({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (
        _req: Express.Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files allowed'), false);
        }
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

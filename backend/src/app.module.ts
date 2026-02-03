import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ResumesModule } from './modules/resumes/resumes.module';
import { SkillsModule } from './modules/skills/skills.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';
import { typeOrmConfig } from './config/typeorm.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '..', '.env'), '.env'],
    }),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    JobsModule,
    ResumesModule,
    SkillsModule,
    InterviewsModule,
    AiModule,
    AdminModule,
  ],
  controllers: [],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Smart Hiring Platform API')
    .setDescription('AI-Powered Hiring & Skill Verification – Resume, Tests, AI Interview')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'JWT & OAuth')
    .addTag('users', 'Candidates & Recruiters')
    .addTag('jobs', 'Job postings')
    .addTag('resumes', 'Resume upload & parsing')
    .addTag('skills', 'Skill tests & verification')
    .addTag('interviews', 'AI video interviews')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
}

bootstrap();

/**
 * 👇 IMPORTANT FOR VERCEL
 * Export the server for serverless environment
 */
export default bootstrap;

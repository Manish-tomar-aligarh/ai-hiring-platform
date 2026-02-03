import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  // Upload root: same dir as backend (works from repo root or backend folder)
  const uploadsRoot = join(__dirname, '..', 'uploads');
  for (const sub of ['', 'resumes', 'interviews']) {
    const dir = sub ? join(uploadsRoot, sub) : uploadsRoot;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  process.env.UPLOAD_DIR = process.env.UPLOAD_DIR || join(uploadsRoot, 'resumes');

  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://ai-hiring-frontend.onrender.com',
    'https://www.ai-hiring-frontend.onrender.com',
  ];
  const envOrigins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) || [];
  app.enableCors({
    origin: [...new Set([...corsOrigins, ...envOrigins])],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Smart Hiring Platform API')
    .setDescription('AI Powered Hiring Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}/api/v1`);
}

bootstrap();

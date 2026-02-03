import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS config (Frontend = Next.js on 3000)
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Smart Hiring Platform API')
    .setDescription('AI Powered Hiring Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // IMPORTANT: Render + Local compatible PORT
  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}/api/v1`);
}

bootstrap();

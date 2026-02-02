import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });
  
  // Vercel handles the path routing, but NestJS needs to know the global prefix if it matches
  // However, usually we want to strip /api/v1 before it hits NestJS or let NestJS handle it.
  // If Vercel rewrites /api/v1/(.*) -> serverless.ts, then the request URL might be /(.*).
  // But usually Vercel preserves the path.
  // Let's keep the global prefix.
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();
  return app.getHttpAdapter().getInstance();
}

let appPromise: Promise<any>;

export default async (req: any, res: any) => {
  if (!appPromise) {
    appPromise = bootstrap();
  }
  const app = await appPromise;
  app(req, res);
};

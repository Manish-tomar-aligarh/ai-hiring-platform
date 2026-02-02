import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

let server: Express | null = null;

async function bootstrap() {
  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.setGlobalPrefix('api/v1');
  await app.init();

  return expressApp;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (!server) {
    server = await bootstrap();
  }
  server(req, res);
}

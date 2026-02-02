import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

// Reusable setup for both HTTP server and potential serverless usage
async function setupApp() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Smart Hiring Platform API')
    .setDescription('AI-Powered Hiring Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  return app;
}

// Used by tests or potential serverless adapters
export async function createApp() {
  const app = await setupApp();
  await app.init();
  return app.getHttpAdapter().getInstance();
}

// Standard HTTP bootstrap for Render / Node runtime
async function bootstrap() {
  const app = await setupApp();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  // Optional simple log for Render logs
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${port}`);
}

// Only auto-bootstrap when running as a script, not when imported
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bootstrap();
}

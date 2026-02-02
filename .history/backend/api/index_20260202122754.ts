import { createApp } from '../src/main';
import serverlessExpress from '@vendia/serverless-express';

let server;

async function bootstrap() {
  const app = await createApp();
  server = serverlessExpress({ app });
  return server;
}

export default async function handler(req, res) {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
}

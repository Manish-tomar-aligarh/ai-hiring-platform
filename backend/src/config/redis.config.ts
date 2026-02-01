import { RedisClientOptions } from 'redis';

export function redisConfig(): RedisClientOptions {
  return {
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

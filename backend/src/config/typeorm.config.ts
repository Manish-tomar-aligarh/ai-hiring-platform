import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export function typeOrmConfig(): TypeOrmModuleOptions {
  const useSqliteEnv = process.env.USE_SQLITE === 'true' || process.env.USE_SQLITE === '1';
  const isProd = process.env.NODE_ENV === 'production';
  const sslEnabled = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

  // If no explicit DB_HOST is provided, default to SQLite file storage.
  const hasExplicitPostgres =
    !!process.env.DB_HOST ||
    !!process.env.DB_USERNAME ||
    !!process.env.DB_DATABASE;

  const useSqlite = useSqliteEnv || !hasExplicitPostgres;

  if (useSqlite) {
    return {
      type: 'better-sqlite3',
      database: join(__dirname, '../../data/smart_hiring.sqlite'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: !isProd,
      logging: !isProd,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'smart_hiring',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: !isProd,
    logging: !isProd,
    ssl: sslEnabled ? { rejectUnauthorized } : undefined,
    extra: sslEnabled ? { ssl: { rejectUnauthorized } } : undefined,
  };
}

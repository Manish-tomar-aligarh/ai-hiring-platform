import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export function typeOrmConfig(): TypeOrmModuleOptions {
  const useSqlite = process.env.USE_SQLITE === 'true' || process.env.USE_SQLITE === '1';

  if (useSqlite) {
    return {
      type: 'better-sqlite3',
      database: join(__dirname, '../../data/smart_hiring.sqlite'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
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
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  };
}

import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  sql: {
    host: process.env.SQL_DB_HOST,
    port: parseInt(process.env.SQL_DB_PORT || '5432', 10),
    username: process.env.SQL_DB_USERNAME,
    password: process.env.SQL_DB_PASSWORD,
    database: process.env.SQL_DB_NAME,
    synchronize: process.env.SQL_DB_SYNCHRONIZE === 'true',
  },
  nosql: {
    uri: process.env.NOSQL_DB_URI,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
}));
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  sql: {
    host: process.env.SQL_DB_HOST,
    port: parseInt(process.env.SQL_DB_PORT, 10) || 5432,
    username: process.env.SQL_DB_USERNAME,
    password: process.env.SQL_DB_PASSWORD,
    database: process.env.SQL_DB_NAME,
    // ssl: process.env.SQL_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  nosqlMongoUri: process.env.NOSQL_MONGO_URI,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
}));

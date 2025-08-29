import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/waitlist',
  name: process.env.DATABASE_NAME || 'waitlist',
  connectionTimeout: parseInt(
    process.env.DATABASE_CONNECTION_TIMEOUT || '10000',
    10,
  ),
  socketTimeout: parseInt(process.env.DATABASE_SOCKET_TIMEOUT || '45000', 10),
  maxPoolSize: parseInt(process.env.DATABASE_MAX_POOL_SIZE || '10', 10),
  minPoolSize: parseInt(process.env.DATABASE_MIN_POOL_SIZE || '2', 10),
  retryAttempts: parseInt(process.env.DATABASE_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.DATABASE_RETRY_DELAY || '5000', 10),
}));

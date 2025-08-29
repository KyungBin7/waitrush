// Set up test environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'mongodb://localhost:27017/waitlist-test';
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:3001';
process.env.RATE_LIMIT_TTL = '60';
process.env.RATE_LIMIT_MAX = '100';

// Additional environment variables for proper validation
process.env.DATABASE_NAME = 'waitlist-test';
process.env.DATABASE_CONNECTION_TIMEOUT = '10000';
process.env.DATABASE_SOCKET_TIMEOUT = '45000';
process.env.DATABASE_MAX_POOL_SIZE = '5';
process.env.DATABASE_MIN_POOL_SIZE = '1';
process.env.DATABASE_RETRY_ATTEMPTS = '3';
process.env.DATABASE_RETRY_DELAY = '5000';
process.env.JWT_EXPIRATION = '24h';
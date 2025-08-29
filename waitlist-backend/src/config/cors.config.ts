import { registerAs } from '@nestjs/config';

export default registerAs('cors', () => {
  const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  // Support multiple origins in production by splitting comma-separated values
  const origins = origin.includes(',')
    ? origin.split(',').map((o) => o.trim())
    : origin;

  return {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  };
});

import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => {
  const ttl = parseInt(process.env.RATE_LIMIT_TTL || '60', 10);
  const limit = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

  // Validate parsed values
  if (isNaN(ttl) || ttl < 1) {
    throw new Error('Invalid RATE_LIMIT_TTL: must be a positive number');
  }

  if (isNaN(limit) || limit < 1) {
    throw new Error('Invalid RATE_LIMIT_MAX: must be a positive number');
  }

  return { ttl, limit };
});

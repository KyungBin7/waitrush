import 'reflect-metadata';
import { validate, EnvironmentVariables } from './env.validation';

describe('Environment Validation', () => {
  it('should validate correct environment variables', () => {
    const validConfig = {
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRATION: '24h',
      CORS_ORIGIN: 'http://localhost:3000',
      RATE_LIMIT_TTL: 60,
      RATE_LIMIT_MAX: 100,
    };

    expect(() => validate(validConfig)).not.toThrow();
    const result = validate(validConfig);
    expect(result).toBeInstanceOf(EnvironmentVariables);
  });

  it('should throw error when JWT_SECRET is not provided', () => {
    const configWithoutJwt = {
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: 'mongodb://localhost:27017/test',
      // JWT_SECRET is missing
    };

    expect(() => validate(configWithoutJwt)).toThrow();
  });

  it('should throw error for invalid PORT range', () => {
    const invalidConfig = {
      NODE_ENV: 'development',
      PORT: 70000, // Invalid port
      DATABASE_URL: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'test-secret',
    };

    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should throw error for invalid RATE_LIMIT_TTL', () => {
    const invalidConfig = {
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'test-secret',
      RATE_LIMIT_TTL: 0, // Invalid - must be >= 1
    };

    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should use default values for optional variables', () => {
    const minimalConfig = {
      DATABASE_URL: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'test-secret',
    };

    const result = validate(minimalConfig);
    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
    expect(result.JWT_EXPIRATION).toBe('24h');
    expect(result.CORS_ORIGIN).toBe('http://localhost:3000');
    expect(result.RATE_LIMIT_TTL).toBe(60);
    expect(result.RATE_LIMIT_MAX).toBe(100);
  });
});

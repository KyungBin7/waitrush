import throttleConfig from './throttle.config';

describe('Throttle Configuration', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return default throttle configuration', () => {
    process.env = { ...originalEnv };
    delete process.env.RATE_LIMIT_TTL;
    delete process.env.RATE_LIMIT_MAX;

    const config = throttleConfig();

    expect(config.ttl).toBe(60);
    expect(config.limit).toBe(100);
  });

  it('should return environment throttle configuration', () => {
    process.env = {
      ...originalEnv,
      RATE_LIMIT_TTL: '30',
      RATE_LIMIT_MAX: '50',
    };

    const config = throttleConfig();

    expect(config.ttl).toBe(30);
    expect(config.limit).toBe(50);
  });

  it('should throw error for non-numeric environment values', () => {
    process.env = {
      ...originalEnv,
      RATE_LIMIT_TTL: 'invalid',
      RATE_LIMIT_MAX: '50',
    };

    expect(() => throttleConfig()).toThrow(
      'Invalid RATE_LIMIT_TTL: must be a positive number',
    );
  });

  it('should throw error for zero or negative values', () => {
    process.env = {
      ...originalEnv,
      RATE_LIMIT_TTL: '0',
      RATE_LIMIT_MAX: '50',
    };

    expect(() => throttleConfig()).toThrow(
      'Invalid RATE_LIMIT_TTL: must be a positive number',
    );
  });
});

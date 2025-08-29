import jwtConfig from './jwt.config';

describe('JWT Configuration', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw error when JWT_SECRET is not provided', () => {
    process.env = { ...originalEnv };
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRATION;

    expect(() => jwtConfig()).toThrow(
      'JWT_SECRET is required but not provided',
    );
  });

  it('should return environment JWT configuration', () => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRATION: '1h',
    };

    const config = jwtConfig();

    expect(config.secret).toBe('test-secret-key');
    expect(config.expiresIn).toBe('1h');
  });
});

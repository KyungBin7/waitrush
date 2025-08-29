import appConfig from './app.config';

describe('App Configuration', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return default app configuration', () => {
    process.env = { ...originalEnv };
    delete process.env.PORT;
    delete process.env.NODE_ENV;

    const config = appConfig();

    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('development');
    expect(config.isDevelopment).toBe(false);
    expect(config.isProduction).toBe(false);
    expect(config.isTest).toBe(false);
  });

  it('should return development environment configuration', () => {
    process.env = {
      ...originalEnv,
      PORT: '4000',
      NODE_ENV: 'development',
    };

    const config = appConfig();

    expect(config.port).toBe(4000);
    expect(config.nodeEnv).toBe('development');
    expect(config.isDevelopment).toBe(true);
    expect(config.isProduction).toBe(false);
    expect(config.isTest).toBe(false);
  });

  it('should return production environment configuration', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
    };

    const config = appConfig();

    expect(config.nodeEnv).toBe('production');
    expect(config.isDevelopment).toBe(false);
    expect(config.isProduction).toBe(true);
    expect(config.isTest).toBe(false);
  });

  it('should return test environment configuration', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
    };

    const config = appConfig();

    expect(config.nodeEnv).toBe('test');
    expect(config.isDevelopment).toBe(false);
    expect(config.isProduction).toBe(false);
    expect(config.isTest).toBe(true);
  });
});

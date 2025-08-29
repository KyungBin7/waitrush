import corsConfig from './cors.config';

describe('CORS Configuration', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return default CORS configuration', () => {
    process.env = { ...originalEnv };
    delete process.env.CORS_ORIGIN;

    const config = corsConfig();

    expect(config.origin).toBe('http://localhost:3000');
    expect(config.credentials).toBe(true);
    expect(config.methods).toEqual([
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
    ]);
    expect(config.allowedHeaders).toEqual([
      'Content-Type',
      'Authorization',
      'Accept',
    ]);
  });

  it('should return environment CORS configuration', () => {
    process.env = {
      ...originalEnv,
      CORS_ORIGIN: 'https://example.com',
    };

    const config = corsConfig();

    expect(config.origin).toBe('https://example.com');
  });

  it('should support multiple CORS origins', () => {
    process.env = {
      ...originalEnv,
      CORS_ORIGIN:
        'https://example.com, https://app.example.com, http://localhost:3001',
    };

    const config = corsConfig();

    expect(config.origin).toEqual([
      'https://example.com',
      'https://app.example.com',
      'http://localhost:3001',
    ]);
  });

  it('should configure frontend origin correctly', () => {
    process.env = {
      ...originalEnv,
      CORS_ORIGIN: 'http://localhost:8080',
    };

    const config = corsConfig();

    expect(config.origin).toBe('http://localhost:8080');
    expect(config.credentials).toBe(true);
    expect(config.methods).toContain('OPTIONS');
  });
});

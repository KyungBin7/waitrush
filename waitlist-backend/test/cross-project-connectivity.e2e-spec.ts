import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cross-Project Connectivity (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Set test environment for CORS origin
    process.env.CORS_ORIGIN = 'http://localhost:8080';

    // Mock database connection for testing with comprehensive interface
    const mockConnection = {
      readyState: 1, // 1 = connected
      on: jest.fn(),
      once: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
      // Additional properties that might be accessed
      db: { databaseName: 'test' },
      host: 'localhost',
      port: 27017,
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getConnectionToken())
      .useValue(mockConnection)
      .compile();

    app = moduleFixture.createNestApplication();
    const configService = app.get(ConfigService);

    // Configure CORS exactly as done in main.ts for consistency
    app.enableCors({
      origin: configService.get<string>('cors.origin'),
      credentials: configService.get<boolean>('cors.credentials'),
      methods: configService.get<string[]>('cors.methods'),
      allowedHeaders: configService.get<string[]>('cors.allowedHeaders'),
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('CORS Configuration', () => {
    it('should allow OPTIONS preflight requests from frontend origin', async () => {
      return request(app.getHttpServer())
        .options('/health')
        .set('Origin', 'http://localhost:8080')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(204) // OPTIONS requests typically return 204 No Content
        .expect((res: request.Response) => {
          expect(res.headers['access-control-allow-origin']).toBe(
            'http://localhost:8080',
          );
          expect(res.headers['access-control-allow-credentials']).toBe('true');
        });
    });

    it('should allow GET requests from frontend origin', async () => {
      return request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'http://localhost:8080')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.headers['access-control-allow-origin']).toBe(
            'http://localhost:8080',
          );
          expect((res.body as { status: string }).status).toBe('ok');
        });
    });

    it('should provide health check endpoint accessible via proxy', async () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res: request.Response) => {
          const body = res.body as {
            status: string;
            database: { status: string };
          };
          expect(body.status).toBe('ok');
          expect(body.database).toBeDefined();
          expect(body.database.status).toBeDefined();
        });
    });

    it('should reject requests from unauthorized origins', async () => {
      return request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'http://malicious-site.com')
        .expect(200) // Health endpoint should still work
        .expect((res: request.Response) => {
          // CORS headers should not include the malicious origin
          expect(res.headers['access-control-allow-origin']).not.toBe(
            'http://malicious-site.com',
          );
          // Should either be undefined or the configured origin
          const allowedOrigin = res.headers['access-control-allow-origin'];
          if (allowedOrigin) {
            expect(allowedOrigin).toBe('http://localhost:8080');
          }
        });
    });

    it('should handle multiple allowed origins correctly', async () => {
      // Set multiple origins in environment
      process.env.CORS_ORIGIN = 'http://localhost:8080, https://myapp.com';

      // Recreate app with new config
      await app.close();

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(getConnectionToken())
        .useValue({
          readyState: 1,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
          close: jest.fn().mockResolvedValue(undefined),
          db: { databaseName: 'test' },
          host: 'localhost',
          port: 27017,
        })
        .compile();

      app = moduleFixture.createNestApplication();
      const configService = app.get(ConfigService);

      app.enableCors({
        origin: configService.get<string>('cors.origin'),
        credentials: configService.get<boolean>('cors.credentials'),
        methods: configService.get<string[]>('cors.methods'),
        allowedHeaders: configService.get<string[]>('cors.allowedHeaders'),
      });

      await app.init();

      // Test both allowed origins
      await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'http://localhost:8080')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.headers['access-control-allow-origin']).toBe(
            'http://localhost:8080',
          );
        });

      await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'https://myapp.com')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.headers['access-control-allow-origin']).toBe(
            'https://myapp.com',
          );
        });
    });
  });
});

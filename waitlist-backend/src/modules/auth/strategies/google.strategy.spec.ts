import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                GOOGLE_CLIENT_ID: 'test-client-id',
                GOOGLE_CLIENT_SECRET: 'test-client-secret',
                GOOGLE_CALLBACK_URL:
                  'http://localhost:3000/auth/google/callback',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user data', async () => {
    const profile = {
      id: 'google-123',
      emails: [{ value: 'test@example.com' }],
      displayName: 'Test User',
      photos: [{ value: 'https://example.com/photo.jpg' }],
    };

    const done = jest.fn();

    await strategy.validate('access-token', 'refresh-token', profile, done);

    expect(done).toHaveBeenCalledWith(null, {
      googleId: 'google-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/photo.jpg',
    });
  });

  it('should handle profile without photo', async () => {
    const profile = {
      id: 'google-123',
      emails: [{ value: 'test@example.com' }],
      displayName: 'Test User',
      photos: [],
    };

    const done = jest.fn();

    await strategy.validate('access-token', 'refresh-token', profile, done);

    expect(done).toHaveBeenCalledWith(null, {
      googleId: 'google-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: undefined,
    });
  });
});

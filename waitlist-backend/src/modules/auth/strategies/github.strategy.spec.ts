import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GitHubStrategy } from './github.strategy';

describe('GitHubStrategy', () => {
  let strategy: GitHubStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                GITHUB_CLIENT_ID: 'test-client-id',
                GITHUB_CLIENT_SECRET: 'test-client-secret',
                GITHUB_CALLBACK_URL:
                  'http://localhost:3000/auth/github/callback',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<GitHubStrategy>(GitHubStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user data', async () => {
    const profile = {
      id: 'github-456',
      username: 'testuser',
      emails: [{ value: 'test@example.com' }],
      photos: [{ value: 'https://example.com/avatar.jpg' }],
    };

    const result = await strategy.validate(
      'access-token',
      'refresh-token',
      profile,
    );

    expect(result).toEqual({
      githubId: 'github-456',
      username: 'testuser',
      email: 'test@example.com',
      picture: 'https://example.com/avatar.jpg',
    });
  });

  it('should handle profile without photo', async () => {
    const profile = {
      id: 'github-456',
      username: 'testuser',
      emails: [{ value: 'test@example.com' }],
      photos: [],
    };

    const result = await strategy.validate(
      'access-token',
      'refresh-token',
      profile,
    );

    expect(result).toEqual({
      githubId: 'github-456',
      username: 'testuser',
      email: 'test@example.com',
      picture: undefined,
    });
  });
});

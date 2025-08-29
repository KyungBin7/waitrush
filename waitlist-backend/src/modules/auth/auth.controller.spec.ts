import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { LoginDto } from './dto/login.dto';
import { SocialAuthDto } from './dto/social-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            validateGoogleAuth: jest.fn(),
            validateGithubAuth: jest.fn(),
            getFullProfile: jest.fn(),
            linkGoogleProvider: jest.fn(),
            linkGithubProvider: jest.fn(),
            unlinkProvider: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new organizer', async () => {
      const createOrganizerDto: CreateOrganizerDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const expectedResult = {
        id: 'mockId',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      authService.signup.mockResolvedValue(expectedResult);

      const result = await controller.signup(createOrganizerDto);

      expect(authService.signup).toHaveBeenCalledWith(createOrganizerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should login and return access token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const expectedResult = { accessToken: 'mockJwtToken' };

      authService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('googleAuth', () => {
    it('should authenticate with Google and return access token', async () => {
      const socialAuthDto: SocialAuthDto = {
        token: 'google-oauth-token',
      };
      const expectedResult = { accessToken: 'mockJwtToken' };

      authService.validateGoogleAuth.mockResolvedValue(expectedResult);

      const result = await controller.googleTokenAuth(socialAuthDto);

      expect(authService.validateGoogleAuth).toHaveBeenCalledWith(
        socialAuthDto.token,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('githubAuth', () => {
    it('should authenticate with GitHub and return access token', async () => {
      const socialAuthDto: SocialAuthDto = {
        token: 'github-oauth-token',
      };
      const expectedResult = { accessToken: 'mockJwtToken' };

      authService.validateGithubAuth.mockResolvedValue(expectedResult);

      const result = await controller.githubTokenAuth(socialAuthDto);

      expect(authService.validateGithubAuth).toHaveBeenCalledWith(
        socialAuthDto.token,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', async () => {
      const mockUser = {
        id: 'mockId',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      const mockRequest = { user: mockUser };

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });

  describe('getFullProfile', () => {
    it('should return full profile with auth methods and social providers', async () => {
      const mockFullProfile = {
        id: 'mockId',
        email: 'test@example.com',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        authMethods: ['email', 'google'],
        socialProviders: [
          {
            provider: 'google',
            providerId: 'google123',
          },
        ],
      };
      const mockRequest = { user: { organizerId: 'mockId' } };

      authService.getFullProfile.mockResolvedValue(mockFullProfile);

      const result = await controller.getFullProfile(mockRequest);

      expect(authService.getFullProfile).toHaveBeenCalledWith('mockId');
      expect(result).toEqual(mockFullProfile);
    });
  });

  describe('linkGoogleProvider', () => {
    it('should link Google provider successfully', async () => {
      const linkProviderDto = { token: 'google-token' };
      const mockRequest = { user: { organizerId: 'mockId' } };
      const expectedResult = { message: 'Google account linked successfully' };

      authService.linkGoogleProvider.mockResolvedValue(expectedResult);

      const result = await controller.linkGoogleProvider(
        mockRequest,
        linkProviderDto,
      );

      expect(authService.linkGoogleProvider).toHaveBeenCalledWith(
        'mockId',
        'google-token',
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('linkGithubProvider', () => {
    it('should link GitHub provider successfully', async () => {
      const linkProviderDto = { token: 'github-token' };
      const mockRequest = { user: { organizerId: 'mockId' } };
      const expectedResult = { message: 'GitHub account linked successfully' };

      authService.linkGithubProvider.mockResolvedValue(expectedResult);

      const result = await controller.linkGithubProvider(
        mockRequest,
        linkProviderDto,
      );

      expect(authService.linkGithubProvider).toHaveBeenCalledWith(
        'mockId',
        'github-token',
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('unlinkProvider', () => {
    it('should unlink provider successfully', async () => {
      const mockRequest = { user: { organizerId: 'mockId' } };
      const provider = 'google';
      const expectedResult = {
        message: 'google account unlinked successfully',
      };

      authService.unlinkProvider.mockResolvedValue(expectedResult);

      const result = await controller.unlinkProvider(mockRequest, provider);

      expect(authService.unlinkProvider).toHaveBeenCalledWith(
        'mockId',
        'google',
      );
      expect(result).toEqual(expectedResult);
    });
  });
});

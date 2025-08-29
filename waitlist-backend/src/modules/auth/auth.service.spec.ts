import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { AuthService } from './auth.service';
import { Organizer } from '../users/schemas/organizer.schema';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt');
jest.mock('axios');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;

  const mockOrganizer = {
    _id: 'mockId',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    createdAt: new Date(),
    save: jest.fn(),
  };

  const mockOrganizerModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const MockOrganizerModel = jest.fn().mockImplementation(() => mockOrganizer);
  Object.assign(MockOrganizerModel, mockOrganizerModel);

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(Organizer.name),
          useValue: MockOrganizerModel,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const createOrganizerDto: CreateOrganizerDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should create a new organizer successfully', async () => {
      mockOrganizerModel.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockOrganizer.save.mockResolvedValue({
        ...mockOrganizer,
        _id: { toString: () => 'mockId' },
        createdAt: { toISOString: () => '2023-01-01T00:00:00.000Z' },
      });

      const result = await service.signup(createOrganizerDto);

      expect(mockOrganizerModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
      expect(result).toEqual({
        id: 'mockId',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockOrganizerModel.findOne.mockResolvedValue(mockOrganizer as any);

      await expect(service.signup(createOrganizerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      mockOrganizerModel.findOne.mockResolvedValue(mockOrganizer as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('mockJwtToken');

      const result = await service.login(loginDto);

      expect(mockOrganizerModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'Password123!',
        'hashedPassword',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ organizerId: 'mockId' });
      expect(result).toEqual({ accessToken: 'mockJwtToken' });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockOrganizerModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockOrganizerModel.findOne.mockResolvedValue(mockOrganizer as any);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateOrganizer', () => {
    it('should return organizer data if found', async () => {
      const mockOrganizerDoc = {
        _id: { toString: () => 'mockId' },
        email: 'test@example.com',
        createdAt: { toISOString: () => '2023-01-01T00:00:00.000Z' },
      };
      mockOrganizerModel.findById.mockResolvedValue(mockOrganizerDoc as any);

      const result = await service.validateOrganizer('mockId');

      expect(mockOrganizerModel.findById).toHaveBeenCalledWith('mockId');
      expect(result).toEqual({
        id: 'mockId',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
      });
    });

    it('should return null if organizer not found', async () => {
      mockOrganizerModel.findById.mockResolvedValue(null);

      const result = await service.validateOrganizer('nonexistentId');

      expect(result).toBeNull();
    });
  });

  describe('validateGoogleAuth', () => {
    it('should create new organizer for Google auth', async () => {
      const mockGoogleResponse = {
        data: {
          email: 'google@example.com',
          user_id: 'google-123',
        },
      };

      mockedAxios.get.mockResolvedValue(mockGoogleResponse);
      mockOrganizerModel.findOne.mockResolvedValue(null);
      mockOrganizer.save.mockResolvedValue({
        ...mockOrganizer,
        _id: { toString: () => 'newMockId' },
      });
      jwtService.sign.mockReturnValue('mockJwtToken');

      const result = await service.validateGoogleAuth('google-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=google-token',
      );
      expect(result).toEqual({ accessToken: 'mockJwtToken' });
    });

    it('should link Google provider to existing organizer', async () => {
      const mockGoogleResponse = {
        data: {
          email: 'test@example.com',
          user_id: 'google-123',
        },
      };

      const existingOrganizer = {
        ...mockOrganizer,
        socialProviders: [],
        save: jest.fn().mockResolvedValue(mockOrganizer),
        _id: { toString: () => 'existingId' },
      };

      mockedAxios.get.mockResolvedValue(mockGoogleResponse);
      // First call for duplicate provider check returns null
      // Second call for finding organizer by email returns existing organizer
      mockOrganizerModel.findOne
        .mockResolvedValueOnce(null) // No existing provider link
        .mockResolvedValueOnce(existingOrganizer); // Existing organizer by email
      jwtService.sign.mockReturnValue('mockJwtToken');

      const result = await service.validateGoogleAuth('google-token');

      expect(existingOrganizer.save).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'mockJwtToken' });
    });

    it('should throw UnauthorizedException for invalid Google token', async () => {
      mockedAxios.get.mockRejectedValue({ response: { status: 400 } });

      await expect(service.validateGoogleAuth('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateGithubAuth', () => {
    it('should create new organizer for GitHub auth', async () => {
      const mockGithubResponse = {
        data: {
          email: 'github@example.com',
          id: 456,
        },
      };

      mockedAxios.get.mockResolvedValue(mockGithubResponse);
      mockOrganizerModel.findOne.mockResolvedValue(null);
      mockOrganizer.save.mockResolvedValue({
        ...mockOrganizer,
        _id: { toString: () => 'newMockId' },
      });
      jwtService.sign.mockReturnValue('mockJwtToken');

      const result = await service.validateGithubAuth('github-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.github.com/user',
        { headers: { Authorization: 'Bearer github-token' } },
      );
      expect(result).toEqual({ accessToken: 'mockJwtToken' });
    });

    it('should handle GitHub account without public email', async () => {
      const mockGithubResponse = {
        data: {
          email: null,
          id: 456,
        },
      };

      const mockEmailResponse = {
        data: [{ email: 'private@example.com', primary: true, verified: true }],
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockGithubResponse)
        .mockResolvedValueOnce(mockEmailResponse);
      mockOrganizerModel.findOne.mockResolvedValue(null);
      mockOrganizer.save.mockResolvedValue({
        ...mockOrganizer,
        _id: { toString: () => 'newMockId' },
      });
      jwtService.sign.mockReturnValue('mockJwtToken');

      const result = await service.validateGithubAuth('github-token');

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ accessToken: 'mockJwtToken' });
    });

    it('should throw UnauthorizedException for invalid GitHub token', async () => {
      mockedAxios.get.mockRejectedValue({ response: { status: 401 } });

      await expect(service.validateGithubAuth('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getFullProfile', () => {
    it('should return full profile with auth methods for email and social accounts', async () => {
      const mockOrganizerWithSocial = {
        _id: 'mockId',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        socialProviders: [
          { provider: 'google', providerId: 'google123' },
          { provider: 'github', providerId: 'github456' },
        ],
      };

      mockOrganizerModel.findById.mockResolvedValue(mockOrganizerWithSocial);

      const result = await service.getFullProfile('mockId');

      expect(mockOrganizerModel.findById).toHaveBeenCalledWith('mockId');
      expect(result).toEqual({
        id: 'mockId',
        email: 'test@example.com',
        createdAt: mockOrganizerWithSocial.createdAt,
        authMethods: ['email', 'google', 'github'],
        socialProviders: [
          { provider: 'google', providerId: 'google123' },
          { provider: 'github', providerId: 'github456' },
        ],
      });
    });

    it('should return profile with only social auth methods for social-only accounts', async () => {
      const mockSocialOnlyOrganizer = {
        _id: 'mockId',
        email: 'test@example.com',
        passwordHash: null,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        socialProviders: [{ provider: 'google', providerId: 'google123' }],
      };

      mockOrganizerModel.findById.mockResolvedValue(mockSocialOnlyOrganizer);

      const result = await service.getFullProfile('mockId');

      expect(result.authMethods).toEqual(['google']);
      expect(result.socialProviders).toEqual([
        { provider: 'google', providerId: 'google123' },
      ]);
    });

    it('should throw NotFoundException for non-existent organizer', async () => {
      mockOrganizerModel.findById.mockResolvedValue(null);

      await expect(service.getFullProfile('nonexistent')).rejects.toThrow(
        'Organizer not found',
      );
    });
  });

  describe('unlinkProvider', () => {
    it('should unlink provider successfully when multiple auth methods exist', async () => {
      const mockOrganizerWithMultipleAuth = {
        _id: 'mockId',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        socialProviders: [
          { provider: 'google', providerId: 'google123' },
          { provider: 'github', providerId: 'github456' },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      mockOrganizerModel.findById.mockResolvedValue(
        mockOrganizerWithMultipleAuth,
      );

      const result = await service.unlinkProvider('mockId', 'google');

      expect(mockOrganizerModel.findById).toHaveBeenCalledWith('mockId');
      expect(mockOrganizerWithMultipleAuth.socialProviders).toEqual([
        { provider: 'github', providerId: 'github456' },
      ]);
      expect(mockOrganizerWithMultipleAuth.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'google account unlinked successfully',
      });
    });

    it('should throw BadRequestException when trying to unlink non-linked provider', async () => {
      const mockOrganizerWithoutGoogle = {
        _id: 'mockId',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        socialProviders: [{ provider: 'github', providerId: 'github456' }],
      };

      mockOrganizerModel.findById.mockResolvedValue(mockOrganizerWithoutGoogle);

      await expect(service.unlinkProvider('mockId', 'google')).rejects.toThrow(
        'google provider is not linked to this account',
      );
    });

    it('should throw BadRequestException when trying to unlink the last auth method', async () => {
      const mockOrganizerWithOnlyGoogle = {
        _id: 'mockId',
        email: 'test@example.com',
        passwordHash: null,
        socialProviders: [{ provider: 'google', providerId: 'google123' }],
      };

      mockOrganizerModel.findById.mockResolvedValue(
        mockOrganizerWithOnlyGoogle,
      );

      await expect(service.unlinkProvider('mockId', 'google')).rejects.toThrow(
        'Cannot unlink the last authentication method. You must have at least one way to access your account.',
      );
    });

    it('should throw NotFoundException for non-existent organizer', async () => {
      mockOrganizerModel.findById.mockResolvedValue(null);

      await expect(
        service.unlinkProvider('nonexistent', 'google'),
      ).rejects.toThrow('Organizer not found');
    });
  });
});

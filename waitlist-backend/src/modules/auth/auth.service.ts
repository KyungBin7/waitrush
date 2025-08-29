import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import {
  Organizer,
  OrganizerDocument,
} from '../users/schemas/organizer.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { WaitlistParticipant, WaitlistParticipantDocument } from '../participants/schemas/participant.schema';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { LoginDto } from './dto/login.dto';
import {
  GoogleTokenInfo,
  GitHubUser,
  GitHubEmail,
} from './interfaces/social-auth.interface';
import { OAuthLoginResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Organizer.name)
    private organizerModel: Model<OrganizerDocument>,
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
    @InjectModel(WaitlistParticipant.name)
    private participantModel: Model<WaitlistParticipantDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(createOrganizerDto: CreateOrganizerDto) {
    const { email, password } = createOrganizerDto;

    const existingOrganizer = await this.organizerModel.findOne({ email });
    if (existingOrganizer) {
      throw new ConflictException('Email already exists');
    }

    if (!password) {
      throw new BadRequestException('Password is required for email signup');
    }

    const passwordHash = await this.hashPassword(password);

    const organizer = new this.organizerModel({
      email,
      passwordHash,
    });

    const savedOrganizer = await organizer.save();

    return this.mapOrganizerResponse(savedOrganizer);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Increased from 10 for better security
    return bcrypt.hash(password, saltRounds);
  }

  private mapOrganizerResponse(organizer: OrganizerDocument) {
    return {
      id: (organizer._id as any).toString(),
      email: organizer.email,
      createdAt: organizer.createdAt.toISOString(),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const organizer = await this.organizerModel.findOne({ email });
    if (!organizer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if this is a social-only account
    if (!organizer.passwordHash) {
      throw new UnauthorizedException(
        'This account uses social login. Please sign in with Google or GitHub.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      organizer.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { organizerId: (organizer._id as any).toString() };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async validateOrganizer(organizerId: string) {
    console.log('Validating organizer with ID:', organizerId);
    
    const organizer = await this.organizerModel.findById(organizerId);
    if (!organizer) {
      console.log('Organizer not found for ID:', organizerId);
      return null;
    }

    console.log('Organizer found:', organizer.email);
    return this.mapOrganizerResponse(organizer);
  }

  async getFullProfile(organizerId: string) {
    console.log('Getting full profile for organizerId:', organizerId);
    
    try {
      let organizer = await this.organizerModel.findById(organizerId);
      if (!organizer) {
        console.log('Organizer not found for ID:', organizerId);
        // Try without converting to ObjectId
        organizer = await this.organizerModel.findOne({ _id: organizerId });
        if (!organizer) {
          throw new NotFoundException('Organizer not found');
        }
        console.log('Found organizer using string query:', organizer.email);
      }

      const authMethods: string[] = [];
      if (organizer.passwordHash) {
        authMethods.push('email');
      }
      if (organizer.socialProviders && organizer.socialProviders.length > 0) {
        organizer.socialProviders.forEach((provider) => {
          if (!authMethods.includes(provider.provider)) {
            authMethods.push(provider.provider);
          }
        });
      }

      return {
        id: (organizer._id as any).toString(),
        email: organizer.email,
        createdAt: organizer.createdAt,
        authMethods,
        socialProviders: organizer.socialProviders || [],
      };
    } catch (error) {
      console.error('Error in getFullProfile:', error);
      throw error;
    }
  }

  async linkGoogleProvider(organizerId: string, token: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Invalid token format');
    }

    try {
      // Verify token with Google
      const response = await axios.get<GoogleTokenInfo>(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
      );

      const { email, user_id } = response.data;

      if (!email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      await this.linkProviderToOrganizer(organizerId, 'google', user_id);
      return { message: 'Google account linked successfully' };
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new UnauthorizedException('Invalid Google token');
      }
      throw error;
    }
  }

  async linkGithubProvider(organizerId: string, token: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Invalid token format');
    }

    try {
      // Verify token with GitHub
      const response = await axios.get<GitHubUser>(
        'https://api.github.com/user',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { email, id } = response.data;

      if (!email) {
        // Get email from GitHub API if not public
        const emailResponse = await axios.get<GitHubEmail[]>(
          'https://api.github.com/user/emails',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const primaryEmail = emailResponse.data.find(
          (e) => e.primary && e.verified,
        );

        if (!primaryEmail) {
          throw new UnauthorizedException(
            'No verified email found in GitHub account',
          );
        }

        response.data.email = primaryEmail.email;
      }

      await this.linkProviderToOrganizer(organizerId, 'github', id.toString());
      return { message: 'GitHub account linked successfully' };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }

  /**
   * Common method to link a social provider to an organizer account
   * Prevents code duplication between Google and GitHub linking methods
   */
  private async linkProviderToOrganizer(
    organizerId: string,
    provider: 'google' | 'github',
    providerId: string,
  ): Promise<void> {
    const organizer = await this.organizerModel.findById(organizerId);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }

    // Check if this provider is already linked to this organizer
    const hasProvider = organizer.socialProviders?.some(
      (p) => p.provider === provider,
    );

    if (hasProvider) {
      throw new ConflictException(
        `${provider} account is already linked to this organizer`,
      );
    }

    // Check if this provider account is linked to another organizer
    const existingOrganizer = await this.organizerModel.findOne({
      'socialProviders.provider': provider,
      'socialProviders.providerId': providerId,
    });

    if (
      existingOrganizer &&
      (existingOrganizer._id as any).toString() !== organizerId
    ) {
      throw new ConflictException(
        `This ${provider} account is already linked to another organizer`,
      );
    }

    // Link the provider
    if (!organizer.socialProviders) {
      organizer.socialProviders = [];
    }
    organizer.socialProviders.push({
      provider,
      providerId,
    });
    await organizer.save();
  }

  async unlinkProvider(organizerId: string, provider: string) {
    const organizer = await this.organizerModel.findById(organizerId);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }

    // Check if this provider is linked
    const hasProvider = organizer.socialProviders?.some(
      (p) => p.provider === provider,
    );

    if (!hasProvider) {
      throw new BadRequestException(
        `${provider} provider is not linked to this account`,
      );
    }

    // Count total auth methods
    const totalAuthMethods =
      (organizer.passwordHash ? 1 : 0) +
      (organizer.socialProviders?.length || 0);

    if (totalAuthMethods <= 1) {
      throw new BadRequestException(
        'Cannot unlink the last authentication method. You must have at least one way to access your account.',
      );
    }

    // Remove the provider
    organizer.socialProviders = organizer.socialProviders!.filter(
      (p) => p.provider !== provider,
    );
    await organizer.save();

    return { message: `${provider} account unlinked successfully` };
  }

  async validateGoogleAuth(token: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Invalid token format');
    }

    try {
      // Verify token with Google
      const response = await axios.get<GoogleTokenInfo>(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
      );

      const { email, user_id } = response.data;

      if (!email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return this.findOrCreateOrganizerBySocial(email, 'google', user_id);
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new UnauthorizedException('Invalid Google token');
      }
      throw error;
    }
  }

  async validateGithubAuth(token: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Invalid token format');
    }

    try {
      // Verify token with GitHub
      const response = await axios.get<GitHubUser>(
        'https://api.github.com/user',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { email, id } = response.data;

      if (!email) {
        // Get email from GitHub API if not public
        const emailResponse = await axios.get<GitHubEmail[]>(
          'https://api.github.com/user/emails',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const primaryEmail = emailResponse.data.find(
          (e) => e.primary && e.verified,
        );

        if (!primaryEmail) {
          throw new UnauthorizedException(
            'No verified email found in GitHub account',
          );
        }

        response.data.email = primaryEmail.email;
      }

      return this.findOrCreateOrganizerBySocial(
        response.data.email!,
        'github',
        id.toString(),
      );
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }

  private async checkSocialAccountExists(
    email: string,
    provider: 'google' | 'github',
    providerId: string,
  ): Promise<{ exists: boolean; organizerId?: string }> {
    // First check if this provider ID is already linked to any account
    const existingProviderLink = await this.organizerModel.findOne({
      'socialProviders.provider': provider,
      'socialProviders.providerId': providerId,
    });

    if (existingProviderLink) {
      return {
        exists: true,
        organizerId: (existingProviderLink._id as any).toString(),
      };
    }

    // Check if there's an account with this email
    const organizer = await this.organizerModel.findOne({ email });

    if (organizer) {
      // Check if this organizer has the social provider linked
      const hasProvider = organizer.socialProviders?.some(
        (p) => p.provider === provider,
      );

      if (hasProvider) {
        return { exists: true, organizerId: (organizer._id as any).toString() };
      }
    }

    // No existing account found
    return { exists: false };
  }

  private async findOrCreateOrganizerBySocial(
    email: string,
    provider: 'google' | 'github',
    providerId: string,
  ) {
    // First check if this provider ID is already linked to any account
    const existingProviderLink = await this.organizerModel.findOne({
      'socialProviders.provider': provider,
      'socialProviders.providerId': providerId,
    });

    if (existingProviderLink) {
      // If the provider is linked to a different email, prevent duplicate linking
      if (existingProviderLink.email !== email) {
        throw new ConflictException(
          `This ${provider} account is already linked to another account`,
        );
      }
      // If it's the same email, just generate token (already linked)
      const payload = {
        organizerId: (existingProviderLink._id as any).toString(),
      };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    }

    let organizer = await this.organizerModel.findOne({ email });

    if (!organizer) {
      // Create new organizer with social auth
      organizer = new this.organizerModel({
        email,
        socialProviders: [
          {
            provider,
            providerId,
          },
        ],
      });
      await organizer.save();
    } else {
      // Update existing organizer with provider if not already linked
      const hasProvider = organizer.socialProviders?.some(
        (p) => p.provider === provider,
      );

      if (!hasProvider) {
        if (!organizer.socialProviders) {
          organizer.socialProviders = [];
        }
        organizer.socialProviders.push({
          provider,
          providerId,
        });
        await organizer.save();
      }
    }

    // Generate JWT token
    const payload = { organizerId: (organizer._id as any).toString() };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  /**
   * Handle OAuth login from Passport strategies
   * This method is called by OAuth callback routes
   */
  async handleOAuthLogin(
    userProfile: any,
    provider: 'google' | 'github',
  ): Promise<OAuthLoginResponse> {
    const { email, googleId, githubId } = userProfile;

    if (!email) {
      throw new UnauthorizedException(`No email found in ${provider} profile`);
    }

    const providerId = provider === 'google' ? googleId : githubId;

    if (!providerId) {
      throw new UnauthorizedException(`No ${provider} ID found in profile`);
    }

    // Check if the account exists (don't create it automatically)
    const result = await this.checkSocialAccountExists(
      email,
      provider,
      providerId.toString(),
    );

    if (!result.exists) {
      // Return signup required response instead of creating account
      return {
        requiresSignup: true,
        email,
        provider,
        providerId: providerId.toString(),
        // Include any additional profile data that might be useful for signup
        profileData: {
          email,
          provider,
          ...(provider === 'google' && userProfile.name
            ? { name: userProfile.name }
            : {}),
          ...(provider === 'github' && userProfile.username
            ? { username: userProfile.username }
            : {}),
          ...(userProfile.picture ? { picture: userProfile.picture } : {}),
        },
      };
    }

    // If account exists, generate token
    const payload = { organizerId: result.organizerId };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, requiresSignup: false };
  }

  async socialSignup(signupData: {
    email: string;
    provider: 'google' | 'github';
    providerId: string;
    additionalData?: any;
  }) {
    const { email, provider, providerId, additionalData } = signupData;

    // Check if account already exists
    const existingCheck = await this.checkSocialAccountExists(
      email,
      provider,
      providerId,
    );
    if (existingCheck.exists) {
      throw new ConflictException(
        'Account already exists. Please login instead.',
      );
    }

    // Check if this provider ID is already linked to another account
    const existingProviderLink = await this.organizerModel.findOne({
      'socialProviders.provider': provider,
      'socialProviders.providerId': providerId,
    });

    if (existingProviderLink) {
      throw new ConflictException(
        `This ${provider} account is already linked to another account`,
      );
    }

    // Create new organizer with social auth
    const organizer = new this.organizerModel({
      email,
      socialProviders: [
        {
          provider,
          providerId,
        },
      ],
      // Add any additional data from signup form
      ...(additionalData?.name && { name: additionalData.name }),
      // You can add more fields here as needed
    });

    await organizer.save();

    // Generate JWT token
    const payload = { organizerId: (organizer._id as any).toString() };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async deleteAccount(organizerId: string) {
    console.log('Deleting account for organizerId:', organizerId);
    
    let organizer = await this.organizerModel.findById(organizerId);
    if (!organizer) {
      console.log('Organizer not found with findById, trying string query');
      organizer = await this.organizerModel.findOne({ _id: organizerId });
      if (!organizer) {
        throw new NotFoundException('Account not found');
      }
    }

    // Get all services owned by this organizer
    const userServices = await this.serviceModel.find({ organizerId: new Types.ObjectId(organizerId) });
    const serviceIds = userServices.map(service => service._id);

    // Count participants before deletion
    const participantCount = serviceIds.length > 0 ? 
      await this.participantModel.countDocuments({ serviceId: { $in: serviceIds } }) : 0;

    // Delete all participants for these services
    if (serviceIds.length > 0) {
      await this.participantModel.deleteMany({ serviceId: { $in: serviceIds } });
    }

    // Delete all services owned by this organizer
    await this.serviceModel.deleteMany({ organizerId: new Types.ObjectId(organizerId) });

    // Finally, delete the organizer account
    await this.organizerModel.findByIdAndDelete(organizerId);

    return { 
      message: 'Account and all associated data deleted successfully',
      deletedAt: new Date().toISOString(),
      deletedServices: serviceIds.length,
      deletedParticipants: participantCount
    };
  }
}

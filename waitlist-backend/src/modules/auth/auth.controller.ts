import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { LoginDto } from './dto/login.dto';
import { SocialAuthDto } from './dto/social-auth.dto';
import { LinkProviderDto } from './dto/link-provider.dto';
import { SocialSignupDto } from './dto/social-signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Google OAuth routes
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Request() req: any, @Res() res: any) {
    // Handle successful Google OAuth callback
    const result = await this.authService.handleOAuthLogin(req.user, 'google');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (result.requiresSignup) {
      // Redirect to signup page with social data
      const params = new URLSearchParams();
      if (result.provider) params.append('provider', result.provider);
      if (result.email) params.append('email', result.email);
      if (result.providerId) params.append('providerId', result.providerId);
      if (result.profileData?.name)
        params.append('name', result.profileData.name);
      if (result.profileData?.picture)
        params.append('picture', result.profileData.picture);

      res.redirect(`${frontendUrl}/auth/social-signup?${params.toString()}`);
    } else {
      // Redirect to success page with token
      res.redirect(`${frontendUrl}/auth/success?token=${result.accessToken}`);
    }
  }

  // GitHub OAuth routes
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Request() req: any, @Res() res: any) {
    // Handle successful GitHub OAuth callback
    const result = await this.authService.handleOAuthLogin(req.user, 'github');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (result.requiresSignup) {
      // Redirect to signup page with social data
      const params = new URLSearchParams();
      if (result.provider) params.append('provider', result.provider);
      if (result.email) params.append('email', result.email);
      if (result.providerId) params.append('providerId', result.providerId);
      if (result.profileData?.username)
        params.append('username', result.profileData.username);
      if (result.profileData?.picture)
        params.append('picture', result.profileData.picture);

      res.redirect(`${frontendUrl}/auth/social-signup?${params.toString()}`);
    } else {
      // Redirect to success page with token
      res.redirect(`${frontendUrl}/auth/success?token=${result.accessToken}`);
    }
  }

  @Post('signup')
  async signup(@Body() createOrganizerDto: CreateOrganizerDto) {
    return this.authService.signup(createOrganizerDto);
  }

  @Post('social-signup')
  async socialSignup(@Body() socialSignupDto: SocialSignupDto) {
    return this.authService.socialSignup(socialSignupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('social/google')
  async googleTokenAuth(@Body() socialAuthDto: SocialAuthDto) {
    return this.authService.validateGoogleAuth(socialAuthDto.token);
  }

  @Post('social/github')
  async githubTokenAuth(@Body() socialAuthDto: SocialAuthDto) {
    return this.authService.validateGithubAuth(socialAuthDto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Request() req: { user: { id: string; email: string; createdAt: string; organizerId: string } },
  ) {
    return this.authService.getFullProfile(req.user.organizerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getFullProfile(@Request() req: any) {
    return this.authService.getFullProfile(req.user.organizerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('link/google')
  async linkGoogleProvider(
    @Request() req: any,
    @Body() linkProviderDto: LinkProviderDto,
  ) {
    return this.authService.linkGoogleProvider(
      req.user.organizerId,
      linkProviderDto.token,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('link/github')
  async linkGithubProvider(
    @Request() req: any,
    @Body() linkProviderDto: LinkProviderDto,
  ) {
    return this.authService.linkGithubProvider(
      req.user.organizerId,
      linkProviderDto.token,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unlink/:provider')
  async unlinkProvider(
    @Request() req: any,
    @Param('provider') provider: string,
  ) {
    return this.authService.unlinkProvider(req.user.organizerId, provider);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(@Request() req: any) {
    return this.authService.deleteAccount(req.user.organizerId);
  }
}

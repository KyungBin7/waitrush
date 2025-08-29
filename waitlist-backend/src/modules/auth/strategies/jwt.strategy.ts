import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'jwt-secret-key',
    });
  }

  async validate(payload: { organizerId: string }) {
    const organizer = await this.authService.validateOrganizer(
      payload.organizerId,
    );
    if (!organizer) {
      throw new UnauthorizedException('Invalid token');
    }
    
    // Include organizerId in the returned user object for controller access
    return {
      ...organizer,
      organizerId: payload.organizerId,
    };
  }
}

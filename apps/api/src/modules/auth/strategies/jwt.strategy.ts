import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigService } from '../../../common/config/app-config.service.js';

interface JwtPayload {
  sub: string; // The User ID
  email: string;
  sid: string; // The Session ID
}

// This strategy is responsible for validating JWTs on protected routes. It checks the token's signature and expiration, and if valid, it extracts the user information and attaches it to the request object.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: AppConfigService) {
    super({
      // Look for the bearer token inside the Authorization header: "Bearer eyJhbG..."
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.auth.accessSecret,
    });
  }

  // This validate() method is called automatically by Passport after it verifies the token's signature and expiration.
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: JwtPayload) {
    // If the token signature is valid, Passport passes the decoded payload here.
    console.log('🔑 [JwtStrategy Debug] Full Token Payload:', payload);
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token structure');
    }

    // Whatever is returned here is automatically attached to req.user
    return {
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sid, // Include session ID in the payload for session management
    };
  }
}

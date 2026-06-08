// src/modules/auth/adapters/google.adapter.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { IdentityProvider } from '@prisma/client';
import type { NormalizedProfile } from '../models/auth-registration.interface.js';

// This adapter transforms the raw profile data returned by Google's OAuth strategy into a normalized format that our AuthService can work with, regardless of the provider.
// It also handles the case where Google may not return a verified email, which is critical for our user provisioning logic.
@Injectable()
export class GoogleAdapter extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      name?: { givenName?: string; familyName?: string };
      emails?: { value: string }[];
      photos?: { value: string }[];
      _json?: { email_verified?: boolean };
    },
  ): NormalizedProfile {
    const { id, name, emails, photos } = profile;

    const isEmailVerified = profile._json?.email_verified === true;

    return {
      provider: IdentityProvider.GOOGLE,
      providerId: id,
      email: emails?.[0]?.value ?? null,
      emailVerified: isEmailVerified,
      fullName: name ? `${name.givenName} ${name.familyName}` : null,
      avatarUrl: photos?.[0]?.value ?? null,
    };
  }
}

// src/modules/auth/adapters/google.adapter.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IdentityProvider } from '@prisma/client';
import { Strategy } from 'passport-google-oauth20';

import type { NormalizedProfile } from '../models/auth-registration.interface.js';

// This adapter transforms the raw profile data returned by Google's OAuth strategy into a normalized format that our AuthService can work with, regardless of the provider.
// It also handles the case where Google may not return a verified email, which is critical for our user provisioning logic.
@Injectable()
export class GoogleAdapter extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clientID: process.env.GOOGLE_CLIENT_ID!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    _accessToken: string,
    _refreshToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any,
  ): Promise<NormalizedProfile> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const { id, name, emails, photos } = profile;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isEmailVerified = profile._json?.email_verified === true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const normalizedProfile: NormalizedProfile = {
      provider: IdentityProvider.GOOGLE,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      providerId: id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      email: emails?.[0]?.value ?? null,
      emailVerified: isEmailVerified,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      fullName: name ? `${name.givenName} ${name.familyName}` : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      avatarUrl: photos?.[0]?.value ?? null,
    };

    return normalizedProfile;
  }
}

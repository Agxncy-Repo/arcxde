import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthRepository } from '../auth.repository';
import { IdentityResolution, NormalizedProfile } from '../models/auth-registration.interface.js';

/*
    (Read-Only) The IdentityResolver is responsible for taking a normalized user profile 
    (from any provider) and determining how it maps to our internal user and identity records. 
    It handles the core logic of matching incoming authentication attempts to existing accounts,
    or flagging them for new account creation. 
*/
@Injectable()
export class IdentityResolver {
  constructor(private readonly authRepository: AuthRepository) {}

  async resolveIdentity(profile: NormalizedProfile): Promise<IdentityResolution> {
    // 1. Scan for exact provider/id match (Returning User)
    const identity = await this.authRepository.findIdentityByProvider(
      profile.provider,
      profile.providerId,
    );

    if (identity) {
      return {
        type: 'EXISTING_IDENTITY',
        provider: profile.provider,
        userId: identity.userId,
      };
    }

    if (!profile.email) {
      throw new BadRequestException('Email address is required from identity provider.');
    }

    // 2. Scan for root user email match if we cant find an exact identity by provider
    // (Stitching/Linking Scenario)
    const existingUser = await this.authRepository.findUserByEmail(profile.email);

    if (existingUser) {
      return {
        type: 'EXISTING_USER_NO_IDENTITY',
        userId: existingUser.id,
        email: profile.email,
      };
    }

    // 3. Complete Stranger (Fresh Creation Scenario)
    const domain = profile.email.split('@')[1] ?? null;

    return {
      type: 'NEW_USER',
      email: profile.email,
      provider: profile.provider,
      providerId: profile.providerId,
      domain,
    };
  }
}

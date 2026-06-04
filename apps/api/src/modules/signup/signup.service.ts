import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailVerificationService } from '../email/verification/email-verification.service.js';
import { IdentityResolver } from '../auth/identity/identity.resolver.js';
import { IndividualSignupBody, PasswordSignupSchema } from '@app/contracts';
import { NormalizedProfile } from '../auth/models/auth-registration.interface.js';
import * as argon2 from 'argon2';

@Injectable()
export class SignupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: EmailVerificationService,
    private readonly identityResolver: IdentityResolver,
  ) {}

  // Password entry at last step after email verification, identity evaluation, and transient state validation
  async finalizePasswordSignup(body: PasswordSignupSchema) {
    const { email, password } = body;
    const formattedEmail = email.trim().toLowerCase();

    // 1. Strict guard barrier checking the short-lived State Layer
    await this.verificationService.validateActiveSessionOrThrow(formattedEmail);

    // 2. Identity Layer: Profile evaluation and validation
    const normalizedProfile = this.mapSignupToNormalizedProfile(body);
    const identityResolution = await this.identityResolver.resolveIdentity(normalizedProfile);

    if (
      identityResolution.type === 'EXISTING_IDENTITY' &&
      identityResolution.provider === 'EMAIL_PASSWORD'
    ) {
      throw new BadRequestException('Password account already exists.');
    }

    const passwordHash = await argon2.hash(password);

    // 3. Execute Core Identity Write Transaction
    const targetUserId = await this.prisma.$transaction(async (tx) => {
      if (identityResolution.type === 'EXISTING_USER_NO_IDENTITY') {
        await tx.identity.create({
          data: {
            userId: identityResolution.userId,
            provider: 'EMAIL_PASSWORD',
            providerId: formattedEmail,
            passwordHash,
          },
        });

        return identityResolution.userId;
      }

      const newUser = await tx.user.create({
        data: {
          email: formattedEmail,
          fullName: normalizedProfile.fullName,
          identities: {
            create: {
              provider: 'EMAIL_PASSWORD',
              providerId: formattedEmail,
              passwordHash,
            },
          },
        },
      });
      return newUser.id;
    });
    // 4. Burn the transient state session after a successful creation write
    await this.verificationService.consumeSession(formattedEmail);

    // 5. Establish session payload and issue tokens
    return this.createAuthenticatedSession(targetUserId);
  }

  /**
   * Helper mapping strategy to turn a credentials registration payload
   * into an object usable by the global identity layer context.
   */
  private mapSignupToNormalizedProfile(body: IndividualSignupBody): NormalizedProfile {
    const formattedEmail = body.email.trim().toLowerCase();
    return {
      provider: 'EMAIL_PASSWORD',
      providerId: formattedEmail,
      email: formattedEmail,
      emailVerified: true, // They successfully cleared the OTP step before hitting this method
      fullName:
        body.firstName && body.lastName
          ? `${body.firstName.trim()} ${body.lastName.trim()}`
          : body.firstName || body.lastName || null,
    };
  }

  /**
   * Generates JWT tokens and handles structural downstream application session states.
   * Replace this placeholder logic with your explicit token generation pipeline.
   */
  private async createAuthenticatedSession(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // TODO: Connect this to your existing TokenMintService / JwtService architecture
    return {
      accessToken: `mock-access-token-for-${userId}`,
      refreshToken: `mock-refresh-token-for-${userId}`,
    };
  }
}

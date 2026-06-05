import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailVerificationService } from '../email/verification/email-verification.service.js';
import { IdentityResolver } from '../auth/identity/identity.resolver.js';
import * as argon2 from 'argon2';
import { AuthService } from '../auth/auth.service';
import { FinalizeRegistrationDto } from '@app/contracts';
import { NormalizedProfile } from '../auth/models/auth-registration.interface';

@Injectable()
export class SignupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: EmailVerificationService,
    private readonly identityResolver: IdentityResolver,
    private readonly authService: AuthService,
  ) {}

  async initializeMagicLinkSignup(body: { email: string }) {
    const formattedEmail = body.email.trim().toLowerCase();

    // 1. Check for existing users
    const existingUser = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (existingUser) {
      // Flow A: If they are fully onboarded, send a regular Login Magic Link
      if (existingUser.onboardingCompleted) {
        await this.verificationService.sendMagicLinkEmail(existingUser.id, formattedEmail, 'LOGIN');
        return { 
          status: 'EXISTING_USER_LINK_SENT', 
        };
      }
      
      // Flow B: If they are an unfinished user, reuse the record and send a fresh token
      await this.verificationService.sendMagicLinkEmail(existingUser.id, formattedEmail, 'SIGNUP');
      return {
        status: 'PENDING_VERIFICATION_LINK_SENT',
        userId: existingUser.id,
      };
    }

    // 2. Flow C: Fresh User -> Lazy-provision the record immediately
    const newUser = await this.prisma.user.create({
      data: {
        email: formattedEmail,
        emailVerified: false,
        onboardingCompleted: false,
      },
    });

    await this.verificationService.sendMagicLinkEmail(newUser.id, formattedEmail, 'SIGNUP');
    
    return { 
      status: 'LINK_SENT', 
      userId: newUser.id,
    };
  }

  

  // Password entry at last step after email verification, identity evaluation, and transient state validation
  async completeUserRegistration(body: FinalizeRegistrationDto) {
    const { token, password, firstName, lastName } = body;

    // 1. Strict Guard Barrier: Look up and validate the active session by its voucher token
    // This returns the verified email bound to this specific onboarding session
    const activeSession = await this.verificationService.validateActiveSessionOrThrow(token);
    const formattedEmail = activeSession.email;

    // 2. Map and resolve the identity footprint
    const normalizedProfile = this.mapSignupToNormalizedProfile(formattedEmail, firstName, lastName);
    const identityResolution = await this.identityResolver.resolveIdentity(normalizedProfile);

    // 3. Evaluate identity states using your resolver outputs
    if (identityResolution.type === 'EXISTING_IDENTITY' && identityResolution.provider === 'EMAIL_PASSWORD' ) {
      throw new BadRequestException('An account with this email address already exists.');
    }

    // Double-check fallback: It should ALWAYS find the lazy-provisioned user row by now
    if (identityResolution.type !== 'EXISTING_USER_NO_IDENTITY') {
      throw new BadRequestException(
        'Registration session expired or user record not found. Please start over.',
      );
    }

    // Hash the password cleanly using argon2
    const passwordHash = await argon2.hash(password);

    // 4. Execute Core Identity Write Transaction
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      // A. Attach the email/password authentication identity to the existing user row
      await tx.identity.create({
        data: {
          userId: identityResolution.userId,
          provider: 'EMAIL_PASSWORD',
          providerId: formattedEmail,
          passwordHash,
        },
      });

      // B. Save concatenated profile fields and flip onboarding completion flags
      return await tx.user.update({
        where: { id: identityResolution.userId },
        data: {
          fullName: normalizedProfile.fullName,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });
    });

    // 5. Burn the temporary onboarding session token state immediately
    await this.verificationService.consumeSession(formattedEmail);

    // 6. Issue full secure authenticated session payload tokens
    const tokens = await this.authService.createAuthenticatedSession(updatedUser.id);

    return {
      user: updatedUser,
      tokens,
    };
  }

  /**
   * Helper mapping strategy to turn a credentials registration payload
   * into an object usable by the global identity layer context.
   */
  private mapSignupToNormalizedProfile(
    email: string,
    firstName: string,
    lastName: string,
  ): NormalizedProfile {
    return {
      provider: 'EMAIL_PASSWORD',
      providerId: email,
      email: email,
      emailVerified: true, // Successfully cleared the Magic Link validation step
      fullName: `${firstName.trim()} ${lastName.trim()}`,
    };
  }
 
}

// src/modules/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository.js';
import { NormalizedProfile } from './models/auth-registration.interface.js';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { IndividualSignupBody, LoginWithCredentialsBody } from '@app/contracts';
import { IdentityResolver } from './identity/identity.resolver.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly identityResolver: IdentityResolver,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticates a user locally via native email and password credentials.
   */
  async loginWithEmailAndPassword(body: LoginWithCredentialsBody) {
    const { email, password } = body;

    // 1. Evaluate the credentials using our pure read-only decision engine
    // For local login, provider is 'LOCAL' and providerId is their email address
    const resolution = await this.identityResolver.resolveIdentity({
      provider: 'EMAIL_PASSWORD',
      providerId: email,
      email: email,
      emailVerified: false, // Assuming email is not yet verified
      fullName: null,
    });

    // If the resolver returns NEW_USER or EXISTING_USER_NO_IDENTITY, it means
    // this user does not have a native 'LOCAL' password identity set up.
    if (resolution.type !== 'EXISTING_IDENTITY') {
      throw new UnauthorizedException('Invalid email or password configuration.');
    }

    // 2. Fetch the target identity specifically to extract its credential hash
    const identity = await this.authRepository.findIdentityByProvider('EMAIL_PASSWORD', email);

    if (!identity || !identity.passwordHash) {
      throw new UnauthorizedException('Invalid email or password configuration.');
    }

    // 3. Cryptographically verify the plain-text password against the Argon2id hash
    const isPasswordValid = await argon2.verify(identity.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password configuration.');
    }

    // 4. Verification complete! Generate, register, and return the session tokens
    const tokens = await this.createAuthenticatedSession(resolution.userId);

    return {
      tokens,
      userId: resolution.userId,
    };
  }
  /**
   * Registers a brand-new individual user using their email and password.
   * Leverages progressive onboarding by keeping profile data optional initially.
   */
  async registerWithEmailandPassword(
    body: IndividualSignupBody,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password, firstName, lastName } = body;

    // 1. Check if an identity or account already exists with this email
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      // Throwing a explicit exception here since this is a dedicated, active signup submission form
      throw new BadRequestException('An account with this email already exists.');
    }

    // 2. Securely hash the plain-text password using Argon2id
    const passwordHash = await argon2.hash(password);

    // 3. Persist the new records inside a database transaction layer
    const newUser = await this.authRepository.createIndividualAccount({
      email,
      passwordHash,
      firstName: firstName || null, // Gracefully fallback to null for progressive onboarding
      lastName: lastName || null,
    });

    // This creates the database session rows, hashes the refresh token, and returns both strings.
    return this.createAuthenticatedSession(newUser.id);
  }

  // Primary service method to handle both registration and login flows for OAuth providers; abstracts the entire process into a single method for controller use
  async registerOrLoginWithProvider(profile: NormalizedProfile) {
    // 1. Attempt to resolve the incoming profile to an existing user identity or account
    const identityResult = await this.resolveAccount(profile);

    // 2. With a resolved user context, generate a new authenticated session with token rotation
    const tokens = await this.createAuthenticatedSession(identityResult.userId);

    // 3. Return the generated tokens along with a flag indicating if this is a new user for frontend onboarding flows
    return {
      tokens,
      isNewUser: identityResult.isNewUser,
    };
  }

  /**
   * Core orchestrator method to resolve an incoming OAuth profile to a user account,
   * handling edge cases around identity linking, new user creation, and organization mapping.
   */
  private async resolveAccount(
    profile: NormalizedProfile,
  ): Promise<{ userId: string; isNewUser: boolean }> {
    // 1. Evaluate the incoming footprint using our pure read-only decision engine
    const resolution = await this.identityResolver.resolveIdentity(profile);

    // 2. Fast-Path: Returning user with an exact identity match
    if (resolution.type === 'EXISTING_IDENTITY') {
      if (profile.emailVerified) {
        this.authRepository.updateUserEmailVerification(resolution.userId, true).catch(() => {
          /* background telemetry */
        });
      }
      return {
        userId: resolution.userId,
        isNewUser: false,
      };
    }

    let matchedOrgId: string | null = null;

    // 3. Domain Check: Only scan for corporate infrastructure auto-joins if this is a brand new account
    if (resolution.type === 'NEW_USER' && resolution.domain) {
      const match = await this.authRepository.findOrganizationByDomain(resolution.domain);
      matchedOrgId = match?.organizationId ?? null;
    }

    // 4. Atomic Execution: Map the resolution data structures directly down to your database transaction layer
    const targetUser = await this.authRepository.upsertUserIdentityAndMembership({
      userId: resolution.type === 'EXISTING_USER_NO_IDENTITY' ? resolution.userId : null, // Passing an ID triggers an Identity Link; null triggers User Creation
      email: resolution.email,
      fullName: profile.fullName || null,
      avatarUrl: profile.avatarUrl || null,
      provider: profile.provider,
      providerId: profile.providerId,
      organizationId: matchedOrgId,
    });

    return {
      userId: targetUser.id,
      isNewUser: resolution.type === 'NEW_USER',
    };
  }

  // Method to create a new authenticated session for a user, including cleanup of expired sessions and secure token generation with hashing for storage
  private async createAuthenticatedSession(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    await this.authRepository.deleteExpiredSessions(userId);
    const temporarySession = await this.authRepository.createSession({
      userId,
      tokenHash: 'TEMP_HOLDING_PREROTATION',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const sessionId = temporarySession.id;

    const tokens = await this.generateSessionTokens(userId, sessionId);
    const tokenHash = this.hashToken(tokens.refreshToken);

    await this.authRepository.updateSessionHash(sessionId, tokenHash);

    return tokens;
  }

  // --- REFRESH TOKEN ROTATION ENGINE ---
  async refreshSession(rawRefreshToken: string) {
    const currentHash = this.hashToken(rawRefreshToken);
    const session = await this.authRepository.findSessionByHash(currentHash);

    if (!session || session.expiresAt < new Date()) {
      if (session) await this.authRepository.deleteSession(session.id);
      throw new UnauthorizedException('Session has expired or is invalid.');
    }

    // Cycle tokens out immediately to enforce rotation rules
    await this.authRepository.deleteSession(session.id);

    const newTokens = await this.generateSessionTokens(session.userId, session.id);
    const newHash = this.hashToken(newTokens.refreshToken);

    await this.authRepository.createSession({
      userId: session.userId,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return newTokens;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateSessionTokens(userId: string, sessionId: string) {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    const accessSecretExpiresIn = (process.env.JWT_ACCESS_TTL || '15m') as any;
    const refreshSecretExpiresIn = (process.env.JWT_REFRESH_TTL || '7d') as any;

    if (!accessSecret || !refreshSecret) {
      throw new Error(
        'Authentication configuration error: Cryptographic environment signatures are missing.',
      );
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, sid: sessionId },
        {
          secret: accessSecret, // Now strictly guaranteed to be a string
          expiresIn: accessSecretExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: refreshSecret, // Now strictly guaranteed to be a string
          expiresIn: refreshSecretExpiresIn,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  // 5. Session Termination Logic for Logout and Token Revocation
  async clearSession(sessionId: string): Promise<void> {
    await this.authRepository.deleteSession(sessionId);
  }
}

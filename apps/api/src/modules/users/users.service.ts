import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteOnboardingDto, FinalizeRegistrationDto } from '@app/contracts';
import * as argon2 from 'argon2'; // Or bcrypt depending on your setup
import { AuthService } from '../auth/auth.service'; // Import AuthService to handle token generation

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async completeOnboarding(userId: string, _dto: CompleteOnboardingDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          onboardingCompleted: true,
          // If tracking metadata fields from the questionnaire:
          // role: dto.role,
          // companyName: dto.companyName,
        },
      });

      return {
        success: true,
        message: 'Onboarding completed successfully.',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          onboardingCompleted: updatedUser.onboardingCompleted,
        },
      };
    } catch (error) {
      throw new NotFoundException('User profile account not found.');
    }
  }

  async completeUserRegistration(dto: FinalizeRegistrationDto) {
    const { token, firstName, lastName, password } = dto;

    // 1. Fetch the temporary signup session row using the token voucher
    const session = await this.prisma.emailVerificationSession.findUnique({
      where: { registrationToken: token },
    });

    // 2. Security Gate: Verify the session is legitimate, active, and unexpired
    if (!session || !session.verified) {
      throw new UnauthorizedException('Invalid or unauthorized registration session.');
    }

    if (new Date() > session.expiresAt) {
      // Clean up the expired session row immediately
      await this.prisma.emailVerificationSession.delete({ where: { id: session.id } });
      throw new UnauthorizedException(
        'Your registration session has expired. Please verify your email again.',
      );
    }

    // 3. Prevent duplicate user creation safety check
    const existingUser = await this.prisma.user.findUnique({
      where: { email: session.email },
    });
    if (existingUser) {
      throw new BadRequestException('An account with this email address already exists.');
    }

    // 4. Hash the password safely
    const hashedPassword = await argon2.hash(password);

    try {
      // 💡 THE SAFEGUARD: Everything inside this transaction rolls back if ANY line fails
      return await this.prisma.$transaction(async (tx) => {
        // Step A: Create operational User profile
        const user = await tx.user.create({
          data: {
            email: session.email,
            fullName: `${firstName} ${lastName}`,
            onboardingCompleted: false, // Ensures fallback tracking
          },
        });

        // Step B: Create Local Password Auth Identity bound to user
        await tx.identity.create({
          data: {
            userId: user.id,
            provider: 'EMAIL_PASSWORD',
            providerId: session.email, // Using email as the unique identifier for this provider
            passwordHash: hashedPassword,
          },
        });

        // Step C: Burn the verification session so it cannot be replayed
        await tx.emailVerificationSession.delete({
          where: { id: session.id },
        });

        // Step D: Spin up the operational tracking session and tokens
        // 💡 CRITICAL: Pass the transaction client 'tx' down if this method writes to a Session table!
        const tokens = await this.authService.createAuthenticatedSessionWithTx(user.id, tx);

        // If we reach this point safely, Prisma commits everything to disk at once
        return {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
          },
          tokens,
        };
      });
    } catch (error: any) {
      // If ANY step above failed, the database completely undid Steps A, B, and C automatically.
      console.error(
        '[completeUserRegistration] transaction failed:',
        error?.message || String(error),
      );
      throw new BadRequestException(
        `Registration aborted and safely rolled back: ${error?.message || String(error)}`,
      );
    }
  }
}

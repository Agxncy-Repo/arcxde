import { Controller, Post, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { EmailVerificationService } from '../email/verification/email-verification.service';
import { ApiZodBody } from '../../common/swagger/zod-swagger.decorator.js';
import { ZodBody } from '../../common/validation/zod.decorators.js';
import {
  emailInitiateSchema,
  type EmailInitiateSchema,
  verifyLinkSchema,
  type VerifyLinkDto,
  finalizeRegistrationSchema,
  type FinalizeRegistrationDto,
} from '@app/contracts';
import { SignupService } from './signup.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Signup')
@Controller({ path: 'signup', version: '1' })
export class SignupController {
  constructor(
    private readonly verificationService: EmailVerificationService,
    private readonly signupService: SignupService,
  ) {}

  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiZodBody(
    emailInitiateSchema,
    'Initiates the email verification process by sending a verification pin to the provided email address.',
  ) //  100% Automated & In Sync
  async initiateVerification(@ZodBody(emailInitiateSchema) body: EmailInitiateSchema) {
    await this.signupService.initializeMagicLinkSignup(body);
    return {
      success: true,
      message: 'Verification pin dispatched successfully. Temp User Created.',
    };
  }

  @Post('verify-link')
  @HttpCode(HttpStatus.OK)
  @ApiZodBody(verifyLinkSchema, "Verifies the verification link sent to the user's email address.")
  async verifyLink(@ZodBody(verifyLinkSchema) body: VerifyLinkDto) {
    const result = await this.verificationService.verifyMagicLink(body.token);
    return {
      success: true,
      message: 'Email address successfully verified.',
      email: result.email,
      registrationToken: result.registrationToken,
      status: result.status,
    };
  }
  @Post('finalize-registration')
  @ApiZodBody(
    finalizeRegistrationSchema,
    'Completes profile registration and provisions the account.',
  )
  async finalizeSignup(
    @ZodBody(finalizeRegistrationSchema) body: FinalizeRegistrationDto,
    @Res({ passthrough: true })
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => void;
    },
  ) {
    // 1. Delegate the database updates and token generation to the service layer
    const result = await this.signupService.completeUserRegistration(body);

    // 2. BAKE THE REFRESH TOKEN INTO A HIGH-SECURITY COOKIE
    res.cookie('refresh_token', result.tokens.refreshToken, {
      httpOnly: true, // Prevents JavaScript / XSS extraction
      secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
      sameSite: 'strict', // Mitigates CSRF vectors
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days matching your session strategy
      path: '/api/v1/auth/refresh', // Restricted exclusively to token rotation routes
    });

    // 3. Return payload to client (accessToken stays cleanly in memory state on frontend)
    return {
      success: true,
      message: 'Account and security identity successfully initialized!',
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }
}

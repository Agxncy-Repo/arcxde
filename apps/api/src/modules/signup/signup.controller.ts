import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailVerificationService } from '../email/verification/email-verification.service';
import { ApiZodBody } from '../../common/swagger/zod-swagger.decorator.js';
import { ZodBody } from '../../common/validation/zod.decorators.js';
import {
  emailInitiateSchema,
  type EmailInitiateSchema,
  verifyLinkSchema,
  type VerifyLinkDto,
  passwordSignupSchema,
  type PasswordSignupSchema,
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
    await this.verificationService.initiateEmailVerification(body.email);
    return { message: 'Verification pin dispatched successfully.' };
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
    };
  }

  @Post('password')
  @ApiZodBody(passwordSignupSchema, 'Creates a new user account with the provided password.')
  async createAccount(@ZodBody(passwordSignupSchema) body: PasswordSignupSchema) {
    return this.signupService.finalizePasswordSignup(body);
  }
}

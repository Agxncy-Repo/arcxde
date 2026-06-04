import { Controller, Patch, UseGuards, Req, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path to your JWT Guard
import {
  type CompleteOnboardingDto,
  completeOnboardingSchema,
  type FinalizeRegistrationDto,
  finalizeRegistrationSchema,
} from '@app/contracts';
import { ZodBody } from '@/common/validation/zod.decorators';
import { ApiZodBody } from '@/common/swagger/zod-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/complete-onboarding')
  @UseGuards(JwtAuthGuard) // 🔒 Protects the endpoint and extracts the user token
  @ApiZodBody(
    completeOnboardingSchema,
    'Completes the onboarding questionnaire for the authenticated user.',
  ) // 100% Automated & In Sync
  @ApiBearerAuth()
  async completeOnboarding(
    @Req() req: any,
    @ZodBody(completeOnboardingSchema) body: CompleteOnboardingDto,
  ) {
    // Passport attaches the parsed token payload to req.user (usually containing sub/id)
    const userId = req.user.id;

    return this.usersService.completeOnboarding(userId, body);
  }

  @Post('finalize-signup')
  @ApiZodBody(
    finalizeRegistrationSchema,
    'Completes profile registration and provisions the account.',
  )
  async finalizeSignup(
    @ZodBody(finalizeRegistrationSchema) body: FinalizeRegistrationDto,

    @Res({ passthrough: true }) res: any, // To set cookies for session management
  ) {
    // Delegate the account creation and token cleanup to the auth service layer
    const result = await this.usersService.completeUserRegistration(body);

    // 2. BAKE THE REFRESH TOKEN INTO A HIGH-SECURITY COOKIE (Mirroring OAuth setup)
    res.cookie('refresh_token', result.tokens.refreshToken, {
      httpOnly: true, // Prevents JavaScript / XSS extraction
      secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
      sameSite: 'strict', // Mitigates CSRF vectors
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days matching DB session window
      path: '/api/v1/auth/refresh', // Restricted exclusively to token rotation routes
    });

    return {
      success: true,
      message: 'Account and security identity successfully initialized!',
      user: result.user,
      accessToken: result.tokens.accessToken, // Safely handled by memory state on frontend
    };
  }
}

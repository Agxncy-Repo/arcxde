import { type CompleteOnboardingDto, completeOnboardingSchema } from '@app/contracts';
import { Controller, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { ApiZodBody } from '@/common/swagger/zod-swagger.decorator';
import { ZodBody } from '@/common/validation/zod.decorators';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path to your JWT Guard

import { UsersService } from './users.service';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any,
    @ZodBody(completeOnboardingSchema) body: CompleteOnboardingDto,
  ) {
    // Passport attaches the parsed token payload to req.user (usually containing sub/id)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const userId: string = req.user.id;

    return this.usersService.completeOnboarding(userId, body);
  }
}

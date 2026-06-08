import { Controller, Patch, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path to your JWT Guard
import { type CompleteOnboardingDto, completeOnboardingSchema } from '@app/contracts';
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
    @Req() req: { user: { id: string } },
    @ZodBody(completeOnboardingSchema) body: CompleteOnboardingDto,
  ) {
    // Passport attaches the parsed token payload to req.user (usually containing sub/id)
    const userId = req.user.id;

    return this.usersService.completeOnboarding(userId, body);
  }
}

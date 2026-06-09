import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteOnboardingDto } from '@app/contracts';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
}

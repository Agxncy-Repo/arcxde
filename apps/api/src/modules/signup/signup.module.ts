import { forwardRef, Module } from '@nestjs/common';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule, // Grants access to the global PrismaService instance
    EmailModule, // Grants access to your EmailService for routing OTPs via Resend
    forwardRef(() => AuthModule), // Grants access to the IdentityResolver context mapping system
  ],
  controllers: [
    SignupController, // Exposes the progressive onboarding /signup/* routes
  ],
  providers: [
    SignupService, // Manages core Identity creation mutations and transactions
  ],
  exports: [
    SignupService, // Allows other modules to consume registration features if necessary
  ],
})
export class SignupModule {}

// apps/api/src/modules/email/email.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailService } from './email.service';
import { EmailVerificationService } from './verification/email-verification.service';

@Module({
  imports: [ConfigModule], // 📦 Allows ConfigService to inject your .env keys inside EmailService
  providers: [EmailService, EmailVerificationService],
  exports: [EmailService, EmailVerificationService], // 🔑 Exporting it allows other modules to use this service
})
export class EmailModule {}

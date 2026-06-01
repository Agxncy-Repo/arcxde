// apps/api/src/modules/email/email.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule], // 📦 Allows ConfigService to inject your .env keys inside EmailService
  providers: [EmailService],
  exports: [EmailService], // 🔑 Exporting it allows other modules to use this service
})
export class EmailModule {}

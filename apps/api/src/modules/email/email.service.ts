// apps/api/src/modules/email/email.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromAddress: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromAddress =
      this.configService.get<string>('EMAIL_FROM_ADDRESS') || 'no-reply@arcxde.com';

    if (!apiKey) {
      this.logger.warn('⚠️ RESEND_API_KEY is missing. Inbound verification emails will fail.');
    }

    this.resend = new Resend(apiKey);
  }

  /**
   * Dispatches a secure 6-digit verification code to a user's inbox during registration.
   */
  async sendVerificationCode(to: string, code: string): Promise<void> {
    const subject = `${code} is your verification code`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Verify your email address</h2>
        <p style="color: #666666; font-size: 14px; line-height: 24px; margin-bottom: 24px;">
          Thanks for signing up! Enter the following code on the registration page to verify your account. This code expires in 15 minutes.
        </p>
        <div style="background-color: #f4f4f5; border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #09090b;">${code}</span>
        </div>
        <p style="color: #9ca3af; font-size: 12px; line-height: 20px; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
          If you did not request this email, you can safely ignore it.
        </p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: [to],
        subject,
        html: htmlContent,
      });

      if (error) {
        this.logger.error(`Failed to send verification email to ${to}: ${error.message}`);
        throw new InternalServerErrorException('Email delivery engine failed.');
      }

      this.logger.log(`🎉 Verification code successfully dispatched to ${to} (ID: ${data?.id})`);
    } catch (err) {
      this.logger.error(`Unexpected error during email transmission to ${to}`, err);
      throw new InternalServerErrorException('Could not process authentication mailer pipeline.');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(email: string, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirm your Email',
      template: './confirmation',
      context: {
        name: 'User',
        url,
      },
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `example.com/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your Password',
      template: './password-reset',
      context: {
        name: 'User',
        url,
      },
    });
  }
}

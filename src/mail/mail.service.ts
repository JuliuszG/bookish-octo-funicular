import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async send(
    template: string,
    to: string,
    subject: string,
    context: unknown[],
  ) {
    await this.mailerService.sendMail({
      to,
      subject,
      template: `./${template}`,
      context,
    });
  }
}

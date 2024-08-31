import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isSecure = configService.get<string>('MAIL_SECURE') === 'true';

        return {
          transport: {
            host: configService.get<string>('MAIL_HOST'),
            port: parseInt(configService.get<string>('MAIL_PORT'), 10),
            secure: isSecure,
            auth: {
              user: configService.get<string>('MAIL_USER'),
              pass: configService.get<string>('MAIL_PASS'),
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: `"No Reply" <${configService.get<string>('MAIL_FROM')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(), // or another adapter if you're using a different template engine
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  exports: [MailerModule],
})
export class EmailModule {}

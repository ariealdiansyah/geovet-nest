import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception-filter';
import { CustomValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
    cors: true,
  });
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  const port = configService.get<number>('PORT');
  await app.listen(port);
  const logger = new Logger(configService.get('APP_NAME'));
  logger.log('Application running on port ' + port);
}
bootstrap();

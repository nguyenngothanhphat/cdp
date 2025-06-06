import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') || 3000;

  app.setGlobalPrefix('api/v1');

  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/api/v1`, 'Bootstrap');
}
bootstrap();
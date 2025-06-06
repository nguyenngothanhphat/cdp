import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
// import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const nodeEnv = configService.get<string>('app.nodeEnv');

  app.enableCors();
  // app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);
  Logger.log(
    `🚀 Main Application is running on: http://localhost:${port} in ${nodeEnv} mode`,
    'Bootstrap',
  );
  Logger.log(
    `🚀 BullMQ Dashboard (nếu cài): http://localhost:${port}/admin/queues`,
    'Bootstrap',
  );
}
bootstrap();

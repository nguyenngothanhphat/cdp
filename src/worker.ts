import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrapWorker() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger:
      process.env.NODE_ENV === 'development'
        ? ['log', 'debug', 'error', 'warn', 'verbose']
        : ['log', 'error', 'warn'],
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.nodeEnv');

  Logger.log(
    `🚀 Worker Service is running and connected to queue in ${nodeEnv} mode`,
    'BootstrapWorker',
  );
}
bootstrapWorker();

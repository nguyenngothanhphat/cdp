import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DataProcessingModule } from './data_processing/data-processing.module';
import { SharedConfigurationModule } from './shared_modules/configuration.module'; // Dùng chung config

async function bootstrapWorker() {
  const appContext = await NestFactory.createApplicationContext(
    DataProcessingModule.forRoot(),
  );

  await appContext.init();
  Logger.log('Customer Data Processing Worker started', 'WorkerBootstrap');
}
bootstrapWorker();
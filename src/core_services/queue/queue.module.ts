import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { CUSTOMER_DATA_QUEUE } from './queue.constants';
import { QueueService } from './queue.service';
import { SharedConfigurationModule } from '../../shared_modules/configuration.module';

@Module({
  imports: [
    SharedConfigurationModule,
    BullModule.forRootAsync({
      imports: [SharedConfigurationModule],
      useFactory: async (configService: ConfigService) => ({
        connection: configService.get('database.redis'),
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: CUSTOMER_DATA_QUEUE,
      // defaultJobOptions: { // Cấu hình mặc định cho jobs trong queue này
      //   attempts: 3,
      //   backoff: { type: 'exponential', delay: 1000 },
      //   removeOnComplete: true,
      //   removeOnFail: 1000, // Giữ lại 1000 job lỗi
      // },
    }),
  ],
  providers: [QueueService],
  exports: [QueueService, BullModule],
})
export class QueueCoreModule {}

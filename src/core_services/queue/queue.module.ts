import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { CUSTOMER_QUEUE_NAME } from './queue.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('database.redis.host'),
          port: configService.get<number>('database.redis.port'),
          password: configService.get<string>('database.redis.password'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: CUSTOMER_QUEUE_NAME,
    }),
  ],
  providers: [QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
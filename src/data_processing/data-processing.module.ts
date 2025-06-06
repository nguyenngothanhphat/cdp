import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { CustomerIngestionProcessor } from './customer-ingestion.processor';
import { TransformationModule } from './transformation/transformation.module';
import { TargetDatabaseModule } from '../target_database/nosql/nosql.module'; // Import module đích
import { CUSTOMER_QUEUE_NAME } from '../core_services/queue/queue.constants';
import { SharedConfigurationModule } from '../shared_modules/configuration.module';

@Module({
  imports: [
    TransformationModule,
    TargetDatabaseModule,
    BullModule.registerQueue({
      name: CUSTOMER_QUEUE_NAME,
    }),
  ],
  providers: [CustomerIngestionProcessor],
})
export class DataProcessingModule {
  static forRoot(): DynamicModule {
    return {
      module: DataProcessingModule,
      imports: [
        SharedConfigurationModule,
        TransformationModule,
        TargetDatabaseModule,
        BullModule.forRootAsync({
          imports: [SharedConfigurationModule],
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
      providers: [CustomerIngestionProcessor],
    };
  }
}
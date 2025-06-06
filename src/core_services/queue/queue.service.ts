import { Injectable, Inject, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { CUSTOMER_QUEUE_NAME, PROCESS_CUSTOMER_JOB } from './queue.constants';
import { UnifiedCustomerDto } from '../../common/dto/unified-customer.dto';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(CUSTOMER_QUEUE_NAME) private readonly customerQueue: Queue,
  ) {}

  async addProcessCustomerJob(customerData: UnifiedCustomerDto): Promise<void> {
    try {
      await this.customerQueue.add(
        PROCESS_CUSTOMER_JOB,
        customerData,
        {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        }
      );
      this.logger.debug(`Added job for customer: ${customerData.email} to queue.`);
    } catch (error) {
      this.logger.error(`Failed to add job for customer ${customerData.email}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
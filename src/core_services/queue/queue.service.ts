import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CUSTOMER_DATA_QUEUE, RAW_CUSTOMER_DATA_JOB } from './queue.constants';

export interface RawCustomerDataPayload {
  source: 'sql' | 'api';
  data: any;
  metadata?: Record<string, any>;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(CUSTOMER_DATA_QUEUE)
    private customerDataQueue: Queue<RawCustomerDataPayload>,
  ) {}

  async addRawCustomerDataJob(payload: RawCustomerDataPayload): Promise<void> {
    try {
      await this.customerDataQueue.add(RAW_CUSTOMER_DATA_JOB, payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });
      this.logger.log(
        `Added job ${RAW_CUSTOMER_DATA_JOB} from source ${payload.source} to queue.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add job to queue: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

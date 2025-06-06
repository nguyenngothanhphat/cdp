import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CUSTOMER_QUEUE_NAME, PROCESS_CUSTOMER_JOB } from '../core_services/queue/queue.constants';
import { UnifiedCustomerDto } from '../common/dto/unified-customer.dto';
import { TransformationService } from './transformation/transformation.service';
import { NoSqlService } from '../target_database/nosql/nosql.service';

@Processor(CUSTOMER_QUEUE_NAME)
export class CustomerIngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(CustomerIngestionProcessor.name);

  constructor(
    private readonly transformationService: TransformationService,
    private readonly noSqlService: NoSqlService,
  ) {
    super();
  }

  async process(job: Job<UnifiedCustomerDto, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name} for customer: ${job.data.email}`);

    try {
      const customerData = job.data;

      const existingCustomer = await this.noSqlService.findCustomerByEmail(customerData.email);

      let finalCustomerData: UnifiedCustomerDto;

      if (existingCustomer) {
        this.logger.debug(`Customer ${customerData.email} already exists. Merging data.`);
        const merged = this.transformationService.mergeCustomerData(existingCustomer, customerData);
        finalCustomerData = {
          ...merged,
          created_at: merged.created_at.toISOString(),
          updated_at: merged.updated_at.toISOString(),
        };
      } else {
        this.logger.debug(`Customer ${customerData.email} is new. Inserting data.`);
        finalCustomerData = customerData;
      }

      await this.noSqlService.upsertCustomer(finalCustomerData);

      this.logger.log(`Successfully processed customer: ${customerData.email} (Job ID: ${job.id})`);
      return { status: 'success', customerEmail: customerData.email };
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id} for customer ${job.data.email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed with error: ${err.message}. Attempts made: ${job.attemptsMade}`,
      err.stack
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.verbose(`Job ${job.id} of type ${job.name} completed successfully.`);
  }
}
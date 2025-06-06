import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import {
  CUSTOMER_DATA_QUEUE,
  RAW_CUSTOMER_DATA_JOB,
} from '../core_services/queue/queue.constants';
import { RawCustomerDataPayload } from '../core_services/queue/queue.service';
import { TransformationService } from './transformation/transformation.service';
import { NosqlService } from '../target_database/nosql/nosql.service';
import { UnifiedCustomerDto } from '../common/dto/unified-customer.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Processor(CUSTOMER_DATA_QUEUE, {
  concurrency: 5,
})
export class CustomerIngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(CustomerIngestionProcessor.name);

  constructor(
    private readonly transformationService: TransformationService,
    private readonly nosqlService: NosqlService,
  ) {
    super();
  }

  async process(
    job: Job<RawCustomerDataPayload, any, typeof RAW_CUSTOMER_DATA_JOB>,
  ): Promise<any> {
    this.logger.log(
      `Processing job ${job.id} (type: ${job.name}) from source ${job.data.source}`,
    );

    try {
      const partialTransformedData = this.transformationService.transform(
        job.data,
      );
      if (!partialTransformedData || !partialTransformedData.email) {
        this.logger.warn(
          `Job ${job.id}: Transformation resulted in no email. Skipping.`,
        );
        return { status: 'skipped', reason: 'no email after transformation' };
      }

      partialTransformedData.sourceSystems = [job.data.source];

      const existingCustomer = await this.nosqlService.findCustomerByEmail(
        partialTransformedData.email,
      );
      let finalCustomerData: UnifiedCustomerDto;

      if (existingCustomer) {
        this.logger.log(
          `Customer with email ${partialTransformedData.email} (cdpId: ${existingCustomer.cdpId}) found. Merging...`,
        );
        finalCustomerData = this.transformationService.merge(
          existingCustomer as any,
          partialTransformedData,
        );
      } else {
        this.logger.log(
          `New customer with email ${partialTransformedData.email}. Creating with cdpId: ${partialTransformedData.cdpId}...`,
        );
        const now = new Date();
        finalCustomerData = {
          cdpId: partialTransformedData.cdpId,
          email: partialTransformedData.email,
          firstName: partialTransformedData.firstName,
          lastName: partialTransformedData.lastName,
          phoneNumber: partialTransformedData.phoneNumber,
          originalCreatedAt: partialTransformedData.originalCreatedAt,
          sourceSystems: partialTransformedData.sourceSystems,
          cdpCreatedAt: now,
          cdpUpdatedAt: now,
        };
      }

      // Validate trước khi lưu
      const customerInstance = plainToInstance(
        UnifiedCustomerDto,
        finalCustomerData,
      );
      const errors = await validate(customerInstance);
      if (errors.length > 0) {
        this.logger.error(
          `Job ${job.id}: Validation failed for customer ${
            finalCustomerData.cdpId
          }: ${JSON.stringify(errors)}`,
        );
        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
      }

      await this.nosqlService.upsertCustomer(customerInstance);
      this.logger.log(
        `Successfully processed and saved customer data for job ${job.id}, cdpId: ${finalCustomerData.cdpId}`,
      );
      return { status: 'success', cdpId: finalCustomerData.cdpId };
    } catch (error) {
      this.logger.error(
        `Job ${job.id}: Error processing - ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(
      `Job ${job.id} (type: ${
        job.name
      }) has completed. Result: ${JSON.stringify(result)}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} (type: ${job.name}) has failed with error: ${err.message}`,
      err.stack,
    );
  }
}

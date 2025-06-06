import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import {
  QueueService,
  RawCustomerDataPayload,
} from '../../core_services/queue/queue.service';

@Injectable()
export class SqlSourceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqlSourceService.name);
  private client: Client;

  constructor(
    private configService: ConfigService,
    private queueService: QueueService,
  ) {
    this.client = new Client(this.configService.get('database.sql'));
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Connected to SQL DB successfully.');
    } catch (error) {
      this.logger.error('Failed to connect to SQL DB', error.stack);
    }
  }

  async onModuleDestroy() {
    await this.client.end();
    this.logger.log('Disconnected from SQL DB.');
  }

  async triggerExtraction(): Promise<void> {
    this.logger.log('Starting SQL customer data extraction...');
    try {
      const batchSize = 100;
      let offset = 0;
      let processedCount = 0;

      while (true) {
        const query = `SELECT id, name, email, address, phone_number, created_at FROM customers ORDER BY id LIMIT $1 OFFSET $2`;
        const res = await this.client.query(query, [batchSize, offset]);
        const customers = res.rows;

        if (customers.length === 0) {
          this.logger.log('No more customers to fetch from SQL DB.');
          break;
        }

        this.logger.log(
          `Fetched ${customers.length} customers from SQL DB (offset: ${offset}). Queuing...`,
        );
        for (const customer of customers) {
          const payload: RawCustomerDataPayload = {
            source: 'sql',
            data: customer,
          };
          await this.queueService.addRawCustomerDataJob(payload);
        }
        processedCount += customers.length;
        offset += customers.length;
      }
      this.logger.log(
        `Finished SQL extraction. Total customers queued: ${processedCount}.`,
      );
    } catch (error) {
      this.logger.error('Error during SQL data extraction', error.stack);
    }
  }
}

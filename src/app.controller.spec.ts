import { Controller, Get, Post, Query, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { SqlSourceService } from './data_sources/sql_source/sql-source.service';
import { RestApiSourceService } from './data_sources/rest_api_source/rest-api-source.service';
import { TransformationService } from './data_processing/transformation/transformation.service';
import { QueueService } from './core_services/queue/queue.service';

@Controller('ingest')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly sqlSourceService: SqlSourceService,
    private readonly restApiSourceService: RestApiSourceService,
    private readonly transformationService: TransformationService,
    private readonly queueService: QueueService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('sql')
  async ingestSqlData(@Query('lastSyncTime') lastSyncTimeString?: string) {
    const lastSyncTime = lastSyncTimeString ? new Date(lastSyncTimeString) : undefined;
    this.logger.log(`Starting SQL data ingestion. lastSyncTime: ${lastSyncTime}`);
    const sqlCustomers = await this.sqlSourceService.getNewOrUpdatedCustomers(lastSyncTime);

    for (const customer of sqlCustomers) {
      const unifiedData = this.transformationService.transformSqlCustomer(customer);
      await this.queueService.addProcessCustomerJob(unifiedData);
    }
    this.logger.log(`Finished ingesting ${sqlCustomers.length} customers from SQL to queue.`);
    return {
      message: `Ingestion from SQL initiated for ${sqlCustomers.length} customers.`,
      count: sqlCustomers.length,
    };
  }

  @Post('api')
  async ingestApiData() {
    this.logger.log('Starting REST API data ingestion.');
    const apiCustomers = await this.restApiSourceService.getAllCustomersFromApi();

    for (const customer of apiCustomers) {
      const unifiedData = this.transformationService.transformRestApiCustomer(customer);
      await this.queueService.addProcessCustomerJob(unifiedData);
    }
    this.logger.log(`Finished ingesting ${apiCustomers.length} customers from REST API to queue.`);
    return {
      message: `Ingestion from REST API initiated for ${apiCustomers.length} customers.`,
      count: apiCustomers.length,
    };
  }

  @Post('all')
  async ingestAllData() {
    this.logger.log('Starting ingestion from all sources.');
    await this.ingestSqlData();
    await this.ingestApiData();
    return { message: 'Full data ingestion process initiated.' };
  }
}
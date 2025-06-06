import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './entities/customer.entity';
import { SqlCustomerData } from '../../common/interfaces/customer.interface';

@Injectable()
export class SqlSourceService {
  private readonly logger = new Logger(SqlSourceService.name);

  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
  ) {}

  async getNewOrUpdatedCustomers(lastSyncTime?: Date): Promise<SqlCustomerData[]> {
    try {
      const query = this.customerRepository.createQueryBuilder('customer');

      if (lastSyncTime) {
        query.where('customer.updated_at > :lastSyncTime', { lastSyncTime });
        this.logger.log(`Fetching incremental SQL data since ${lastSyncTime.toISOString()}`);
      } else {
        this.logger.log('Fetching full SQL data.');
      }

      const customers = await query.getMany();
      this.logger.log(`Fetched ${customers.length} customers from SQL.`);
      return customers.map(c => ({
        id: c.id,
        email: c.email,
        phone_number: c.phone_number,
        first_name: c.first_name,
        last_name: c.last_name,
        address_line1: c.address_line1,
        city: c.city,
        country: c.country,
        dob: c.dob,
        loyalty_points: c.loyalty_points,
        last_order_date: c.last_order_date,
        updated_at: c.updated_at,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch customers from SQL: ${error.message}`, error.stack);
      throw error;
    }
  }
}
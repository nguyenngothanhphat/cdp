import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './schemas/customer.schema';
import { UnifiedCustomerDto } from '../../common/dto/unified-customer.dto';
import { UnifiedCustomer } from '../../common/interfaces/customer.interface';

@Injectable()
export class NoSqlService {
  private readonly logger = new Logger(NoSqlService.name);

  constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>) {}

  async findCustomerByEmail(email: string): Promise<UnifiedCustomer | null> {
    try {
      const customer = await this.customerModel.findOne({ email }).exec();
      return customer ? customer.toObject() : null;
    } catch (error) {
      this.logger.error(`Failed to find customer by email ${email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async upsertCustomer(customerData: UnifiedCustomerDto): Promise<UnifiedCustomer> {
    try {
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      const result = await this.customerModel.findOneAndUpdate(
        { email: customerData.email },
        {
          $set: {
            ...customerData,
            updated_at: new Date(),
          },
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        options
      ).exec();

      this.logger.debug(`Upserted customer: ${result.email}`);
      return result.toObject();
    } catch (error) {
      this.logger.error(`Failed to upsert customer ${customerData.email}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
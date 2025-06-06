import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UnifiedMongoCustomer,
  CustomerDocument,
} from './schemas/customer.schema';
import { UnifiedCustomerDto } from '../../common/dto/unified-customer.dto';

@Injectable()
export class NosqlService {
  private readonly logger = new Logger(NosqlService.name);

  constructor(
    @InjectModel(UnifiedMongoCustomer.name)
    private customerModel: Model<CustomerDocument>,
  ) {}

  async findCustomerByEmail(email: string): Promise<CustomerDocument | null> {
    return this.customerModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findCustomerByCdpId(cdpId: string): Promise<CustomerDocument | null> {
    return this.customerModel.findOne({ cdpId }).exec();
  }

  async upsertCustomer(
    customerData: UnifiedCustomerDto,
  ): Promise<CustomerDocument> {
    this.logger.debug(`Upserting customer with cdpId: ${customerData.cdpId}`);
    return this.customerModel
      .findOneAndUpdate(
        { cdpId: customerData.cdpId },
        {
          $set: customerData,
          $setOnInsert: {
            cdpCreatedAt: customerData.cdpCreatedAt || new Date(),
          },
        },
        { upsert: true, new: true, runValidators: true },
      )
      .exec();
  }
}

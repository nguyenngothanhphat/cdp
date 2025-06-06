import { Injectable, Logger } from '@nestjs/common';
import { SqlCustomerData, RestApiCustomerData, UnifiedCustomer } from '../../common/interfaces/customer.interface';
import { UnifiedCustomerDto } from '../../common/dto/unified-customer.dto';

@Injectable()
export class TransformationService {
  private readonly logger = new Logger(TransformationService.name);

  transformSqlCustomer(sqlData: SqlCustomerData): UnifiedCustomerDto {
    return {
      common_id: sqlData.id,
      email: sqlData.email,
      phone: sqlData.phone_number,
      first_name: sqlData.first_name,
      last_name: sqlData.last_name,
      address: {
        street: sqlData.address_line1,
        city: sqlData.city,
        country: sqlData.country,
      },
      birth_date: sqlData.dob?.toISOString().split('T')[0],
      loyalty_points: sqlData.loyalty_points,
      last_purchase_date: sqlData.last_order_date?.toISOString().split('T')[0],
      source_system: ['sql'],
      created_at: new Date().toISOString(),
      updated_at: sqlData.updated_at.toISOString(),
    };
  }

  transformRestApiCustomer(apiData: RestApiCustomerData): UnifiedCustomerDto {
    return {
      common_id: apiData.customerId,
      email: apiData.emailAddress,
      phone: apiData.contactNo,
      first_name: apiData.firstName,
      last_name: apiData.lastName,
      address: {
        street: apiData.shippingAddress?.street,
        city: apiData.shippingAddress?.city,
        country: apiData.shippingAddress?.country,
      },
      birth_date: apiData.birthday,
      api_specific_data: {
        segment: apiData.segment,
        subscription_status: apiData.subscriptionStatus,
      },
      source_system: ['api'],
      created_at: new Date().toISOString(),
      updated_at: apiData.lastModified,
    };
  }

  mergeCustomerData(existingCustomer: UnifiedCustomer, newCustomerData: UnifiedCustomerDto): UnifiedCustomer {
    const mergedCustomer: UnifiedCustomer = { ...existingCustomer };

    mergedCustomer.email = newCustomerData.email || mergedCustomer.email;
    mergedCustomer.phone = newCustomerData.phone || mergedCustomer.phone;
    mergedCustomer.first_name = newCustomerData.first_name || mergedCustomer.first_name;
    mergedCustomer.last_name = newCustomerData.last_name || mergedCustomer.last_name;
    mergedCustomer.birth_date = newCustomerData.birth_date || mergedCustomer.birth_date;
    mergedCustomer.loyalty_points = newCustomerData.loyalty_points || mergedCustomer.loyalty_points;
    mergedCustomer.last_purchase_date = newCustomerData.last_purchase_date || mergedCustomer.last_purchase_date;

    if (newCustomerData.address) {
      mergedCustomer.address = {
        ...mergedCustomer.address,
        ...newCustomerData.address,
      };
    }

    if (newCustomerData.api_specific_data) {
      mergedCustomer.api_specific_data = {
        ...mergedCustomer.api_specific_data,
        ...newCustomerData.api_specific_data,
      };
    }

    if (newCustomerData.source_system && Array.isArray(newCustomerData.source_system)) {
      mergedCustomer.source_system = [...new Set([...(mergedCustomer.source_system || []), ...newCustomerData.source_system])];
    }

    mergedCustomer.updated_at = new Date();

    return mergedCustomer;
  }
}
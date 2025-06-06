import { Injectable, Logger } from '@nestjs/common';
import { UnifiedCustomerDto } from '../../common/dto/unified-customer.dto';
import { RawCustomerDataPayload } from '../../core_services/queue/queue.service';
import { v5 as uuidv5 } from 'uuid';

const CDP_NAMESPACE_UUID = 'YOUR-CDP-NAMESPACE-UUID-HERE';

@Injectable()
export class TransformationService {
  private readonly logger = new Logger(TransformationService.name);

  private generateCdpId(email: string): string {
    return uuidv5(email.toLowerCase(), CDP_NAMESPACE_UUID);
  }

  transform(payload: RawCustomerDataPayload): Partial<UnifiedCustomerDto> {
    this.logger.debug(`Transforming data from source: ${payload.source}`);
    let transformed: Partial<UnifiedCustomerDto> = {};

    if (payload.source === 'sql') {
      const sqlData = payload.data;
      transformed = {
        email: sqlData.email?.toLowerCase(),
        firstName: sqlData.name?.split(' ')[0],
        lastName: sqlData.name?.split(' ').slice(1).join(' '),
        phoneNumber: sqlData.phone_number,
        originalCreatedAt: sqlData.created_at
          ? new Date(sqlData.created_at)
          : undefined,
      };
    } else if (payload.source === 'api') {
      const apiData = payload.data;
      transformed = {
        email: apiData.attributes?.email?.toLowerCase(),
        firstName: apiData.attributes?.firstName,
        lastName: apiData.attributes?.lastName,
        phoneNumber: apiData.attributes?.phone,
        originalCreatedAt: apiData.registeredDate
          ? new Date(apiData.registeredDate)
          : undefined,
      };
    }

    if (!transformed.email) {
      this.logger.warn(
        `Skipping transformation for data without email: ${JSON.stringify(
          payload.data,
        )}`,
      );
      return null;
    }
    transformed.cdpId = this.generateCdpId(transformed.email);
    return transformed;
  }

  merge(
    existingCustomer: UnifiedCustomerDto,
    newData: Partial<UnifiedCustomerDto>,
  ): UnifiedCustomerDto {
    this.logger.debug(`Merging data for cdpId: ${existingCustomer.cdpId}`);

    const merged = { ...existingCustomer };

    if (newData.firstName && !merged.firstName)
      merged.firstName = newData.firstName;
    if (newData.lastName && !merged.lastName)
      merged.lastName = newData.lastName;
    if (newData.phoneNumber && !merged.phoneNumber)
      merged.phoneNumber = newData.phoneNumber;

    const newSource = newData.sourceSystems?.[0];
    if (newSource && !merged.sourceSystems?.includes(newSource)) {
      merged.sourceSystems = [...(merged.sourceSystems || []), newSource];
    }

    if (
      newData.originalCreatedAt &&
      (!merged.originalCreatedAt ||
        newData.originalCreatedAt < merged.originalCreatedAt)
    ) {
      merged.originalCreatedAt = newData.originalCreatedAt;
    }

    merged.cdpUpdatedAt = new Date();
    return merged;
  }
}

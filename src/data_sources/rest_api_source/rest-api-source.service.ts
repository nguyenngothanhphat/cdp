import { Injectable, Logger, HttpService } from '@nestjs/common';
import { RestApiCustomerData } from '../../common/interfaces/customer.interface';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RestApiSourceService {
  private readonly logger = new Logger(RestApiSourceService.name);
  private apiBaseUrl: string;
  private apiKey: string; // Ví dụ dùng API Key

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('REST_API_BASE_URL');
    this.apiKey = this.configService.get<string>('REST_API_KEY');
  }

  async getCustomersFromApi(page: number = 1, pageSize: number = 100): Promise<RestApiCustomerData[]> {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`, // Hoặc 'X-API-Key'
        },
        params: {
          page,
          pageSize,
        },
      };

      const response = await lastValueFrom(
        this.httpService.get<RestApiCustomerData[]>(`${this.apiBaseUrl}/customers`, config),
      );

      this.logger.log(`Fetched ${response.data.length} customers from REST API, page ${page}.`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch customers from REST API: ${error.message}`, error.stack);
      if (error.response && error.response.status === 429) {
        this.logger.warn('REST API rate limit hit. Consider implementing retry logic with backoff.');
      }
      throw error;
    }
  }

  async getAllCustomersFromApi(): Promise<RestApiCustomerData[]> {
    let allCustomers: RestApiCustomerData[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      const customers = await this.getCustomersFromApi(page, pageSize);
      allCustomers = allCustomers.concat(customers);

      if (customers.length < pageSize) {
        // Đã lấy hết dữ liệu
        break;
      }
      page++;
    }
    this.logger.log(`Successfully fetched total ${allCustomers.length} customers from REST API.`);
    return allCustomers;
  }
}
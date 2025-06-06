import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Customer Data Platform Ingestion Service is running!';
  }
}
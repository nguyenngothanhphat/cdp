import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RestApiSourceService } from './rest-api-source.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [RestApiSourceService],
  exports: [RestApiSourceService],
})
export class RestApiSourceModule {}
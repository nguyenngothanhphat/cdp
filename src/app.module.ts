import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedConfigurationModule } from './shared_modules/configuration.module';
import { AwsModule } from './core_services/aws/aws.module';
import { QueueModule } from './core_services/queue/queue.module';
import { SqlSourceModule } from './data_sources/sql_source/sql-source.module';
import { RestApiSourceModule } from './data_sources/rest_api_source/rest-api-source.module';
import { TargetDatabaseModule } from './target_database/nosql/nosql.module';

@Module({
  imports: [
    SharedConfigurationModule,
    AwsModule,
    QueueModule,
    SqlSourceModule,
    RestApiSourceModule,
    TargetDatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
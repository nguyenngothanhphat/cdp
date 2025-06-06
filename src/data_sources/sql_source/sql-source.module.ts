import { Module } from '@nestjs/common';
import { SqlSourceService } from './sql-source.service';
import { QueueCoreModule } from '../../core_services/queue/queue.module';
import { SharedConfigurationModule } from '../../shared_modules/configuration.module';

@Module({
  imports: [SharedConfigurationModule, QueueCoreModule],
  providers: [SqlSourceService],
  exports: [SqlSourceService],
})
export class SqlSourceModule {}

import { Module, Global } from '@nestjs/common';
import { SecretsManagerService } from './secrets-manager.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SecretsManagerService],
  exports: [SecretsManagerService],
})
export class AwsModule {}
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsManagerService {
  private readonly logger = new Logger(SecretsManagerService.name);
  private client: SecretsManagerClient;
  private secretId: string;

  constructor(private configService: ConfigService) {
    const awsConfig = this.configService.get('aws');
    this.secretId = awsConfig.secretsManager.secretId;

    this.client = new SecretsManagerClient({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
  }

  async getSecret<T = any>(): Promise<T | null> {
    if (!this.secretId) {
      this.logger.warn('AWS_SECRETS_MANAGER_SECRET_ID is not configured. Skipping Secrets Manager lookup.');
      return null;
    }

    try {
      this.logger.log(`Attempting to retrieve secret: ${this.secretId}`);
      const command = new GetSecretValueCommand({ SecretId: this.secretId });
      const data = await this.client.send(command);

      if (data.SecretString) {
        this.logger.log('Secret retrieved successfully.');
        return JSON.parse(data.SecretString) as T;
      }

      this.logger.warn('No secret string found for the specified SecretId.');
      return null;
    } catch (error) {
      this.logger.error(`Failed to retrieve secret ${this.secretId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
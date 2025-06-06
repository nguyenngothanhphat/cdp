import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqlSourceService } from './sql-source.service';
import { CustomerEntity } from './entities/customer.entity'; // Bạn cần tạo entity này

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres', // hoặc 'mysql'
        host: configService.get<string>('database.sql.host'),
        port: configService.get<number>('database.sql.port'),
        username: configService.get<string>('database.sql.username'),
        password: configService.get<string>('database.sql.password'),
        database: configService.get<string>('database.sql.database'),
        entities: [CustomerEntity],
        synchronize: configService.get<boolean>('database.sql.synchronize'), // Chỉ dùng cho dev
      }),
    }),
    TypeOrmModule.forFeature([CustomerEntity]),
  ],
  providers: [SqlSourceService],
  exports: [SqlSourceService],
})
export class SqlSourceModule {}
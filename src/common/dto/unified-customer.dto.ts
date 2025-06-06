import { IsEmail, IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class UnifiedCustomerDto {
  @IsString()
  common_id: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  address?: AddressDto;

  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @IsOptional()
  @IsNumber()
  loyalty_points?: number;

  @IsOptional()
  @IsDateString()
  last_purchase_date?: string;

  @IsOptional()
  api_specific_data?: Record<string, any>;

  @IsOptional()
  @IsString({ each: true })
  source_system?: string[];

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UnifiedCustomerDto {
  @IsString()
  @IsNotEmpty()
  cdpId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  // @ValidateNested() // Nếu có sub-DTO
  // @Type(() => AddressDto)
  // @IsOptional()
  // address?: AddressDto;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  originalCreatedAt?: Date;

  @IsString({ each: true })
  @IsOptional()
  sourceSystems?: string[];

  @IsDate()
  @Type(() => Date)
  cdpCreatedAt: Date;

  @IsDate()
  @Type(() => Date)
  cdpUpdatedAt: Date;
}

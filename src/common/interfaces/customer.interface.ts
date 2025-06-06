import { UnifiedCustomerDto } from "../dto/unified-customer.dto";

export interface SqlCustomerData {
  id: string;
  email: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  address_line1?: string;
  city?: string;
  country?: string;
  dob?: Date;
  loyalty_points?: number;
  last_order_date?: Date;
  updated_at: Date;
}

export interface RestApiCustomerData {
  customerId: string;
  emailAddress: string;
  contactNo?: string;
  firstName?: string;
  lastName?: string;
  shippingAddress?: {
    street: string;
    city: string;
    country: string;
  };
  birthday?: string;
  segment?: string;
  subscriptionStatus?: string;
  lastModified: string;
}

export interface UnifiedCustomer extends Omit<UnifiedCustomerDto, 'created_at' | 'updated_at'> {
  _id?: string;
  created_at: Date;
  updated_at: Date;
}
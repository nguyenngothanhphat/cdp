import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Customer {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  common_id: string;

  @Prop()
  phone?: string;

  @Prop()
  first_name?: string;

  @Prop()
  last_name?: string;

  @Prop({ type: Object })
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };

  @Prop()
  birth_date?: string;

  @Prop()
  loyalty_points?: number;

  @Prop()
  last_purchase_date?: string;

  @Prop({ type: Object })
  api_specific_data?: Record<string, any>;

  @Prop([String])
  source_system?: string[];

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index({ email: 1 });
CustomerSchema.index({ common_id: 1 });
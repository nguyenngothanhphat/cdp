import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = UnifiedMongoCustomer & Document;

@Schema({
  timestamps: { createdAt: 'cdpCreatedAt', updatedAt: 'cdpUpdatedAt' },
  collection: 'unified_customers',
})
export class UnifiedMongoCustomer {
  @Prop({ required: true, unique: true, index: true })
  cdpId: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true })
  email: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: Date })
  originalCreatedAt?: Date;

  @Prop({ type: [String], index: true })
  sourceSystems?: string[];
}

export const CustomerSchema =
  SchemaFactory.createForClass(UnifiedMongoCustomer);

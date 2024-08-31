import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Customers {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    default: null,
  })
  name: string;

  @Prop({
    type: String,
    default: null,
  })
  phone: string;

  @Prop({
    type: String,
    default: null,
  })
  address: string;

  @Prop({
    type: String,
    default: null,
  })
  memberType: string;
}

export const CustomersSchema = SchemaFactory.createForClass(Customers);

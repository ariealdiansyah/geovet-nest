import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Pet {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    default: null,
  })
  medicalNumber: string;

  @Prop({
    type: String,
    default: null,
  })
  name: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Customers',
    required: true,
    default: null,
  })
  customerId: Types.ObjectId;

  @Prop({
    type: String,
    default: null,
  })
  type: string;

  @Prop({
    type: String,
    default: null,
  })
  sex: string;

  @Prop({
    type: String,
    default: null,
  })
  characteristic: string;
}

export const PetSchema = SchemaFactory.createForClass(Pet);

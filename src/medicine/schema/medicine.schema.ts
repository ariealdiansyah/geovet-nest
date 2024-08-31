import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Medicine {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    default: null,
  })
  name: string;

  @Prop({
    type: Number,
    default: 0,
  })
  price: number;

  @Prop({
    type: Number,
    default: 0,
  })
  buyPrice: number;

  @Prop({
    type: String,
    default: null,
  })
  type: string;
}

export const MedicineSchema = SchemaFactory.createForClass(Medicine);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Groceries {
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
  stock: number;

  @Prop({
    type: Number,
    default: 0,
  })
  buyPrice: number;

  @Prop({
    type: Number,
    default: 0,
  })
  price: number;

  @Prop({
    type: String,
    default: null,
  })
  type: string;
}

export const GroceriesSchema = SchemaFactory.createForClass(Groceries);

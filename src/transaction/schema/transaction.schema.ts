import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Transaction {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: Date,
    default: null,
  })
  transactionDate: Date;

  @Prop({
    type: Number,
    default: 0,
    min: -Infinity,
  })
  totalAmount: number;

  @Prop({
    type: Number,
    default: 0,
  })
  totalPrice: number;

  @Prop({
    type: Number,
    default: 0,
  })
  discount: number;

  @Prop({
    type: Number,
    default: 0,
  })
  pay: number;

  @Prop({
    type: Number,
    default: 0,
  })
  change: number;

  @Prop({
    type: String,
    default: null,
  })
  status: string;

  @Prop({
    type: String,
    default: null,
  })
  paymentMethod: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

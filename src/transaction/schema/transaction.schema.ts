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
  })
  totalAmount: number;

  @Prop({
    type: String,
    default: null,
  })
  status: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

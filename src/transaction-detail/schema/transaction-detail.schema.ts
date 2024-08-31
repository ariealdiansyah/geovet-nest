import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class TransactionDetail {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Transaction',
    required: true,
    default: null,
  })
  transactionId: Types.ObjectId;

  @Prop({
    type: Boolean,
    default: null,
  })
  isMedicine: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Medicine',
    default: null,
  })
  medicineId: Types.ObjectId;

  @Prop({
    type: Boolean,
    default: null,
  })
  isGroceries: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Groceries',
    default: null,
  })
  groceriesId: Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
  })
  amount: number;

  @Prop({
    type: Number,
    default: 0,
  })
  price: number;

  @Prop({
    type: Number,
    default: 0,
  })
  totalPrice: number;
}

export const TransactionDetailSchema =
  SchemaFactory.createForClass(TransactionDetail);

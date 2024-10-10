import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class PetHotel {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: Date,
    default: null,
  })
  checkinDate: Date;

  @Prop({
    type: Date,
    default: null,
  })
  checkoutDate: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Pet',
    required: true,
    default: null,
  })
  petId: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Customers',
    required: true,
    default: null,
  })
  customerId: string;

  @Prop({
    type: String,
    default: null,
  })
  temperature: string;

  @Prop({
    type: Number,
    default: null,
  })
  weight: number;

  @Prop({
    type: String,
    default: null,
  })
  healthStatus: string;

  @Prop({
    type: String,
    default: null,
  })
  healthInfo: string;

  @Prop({
    type: Number,
    default: null,
  })
  duration: number;

  @Prop({
    type: String,
    default: null,
  })
  status: string;

  @Prop({
    type: Number,
    default: null,
  })
  totalPrice: number;

  @Prop({
    type: Boolean,
    default: null,
  })
  hasTransaction: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Transaction',
    default: null,
  })
  transactionId: Types.ObjectId;

  @Prop({
    type: String,
    default: null,
  })
  exitHealthStatus: string;

  @Prop({
    type: String,
    default: null,
  })
  exitTemperature: string;

  @Prop({
    type: Number,
    default: null,
  })
  exitWeight: number;

  @Prop({
    type: String,
    default: null,
  })
  exitHealthInfo: string;

  @Prop({
    type: String,
    default: null,
  })
  roomNumber: string;

  @Prop({
    type: String,
    default: null,
  })
  roomType: string;

  @Prop({
    type: String,
    default: null,
  })
  codeString: string;
}

export const PetHotelSchema = SchemaFactory.createForClass(PetHotel);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Appointment {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: Date,
    default: new Date(),
  })
  date: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Pet',
    default: null,
  })
  petId: Types.ObjectId;

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
  context: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

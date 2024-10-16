import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class MedicalRecord {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: Date,
    default: null,
  })
  medicalDate: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Pet',
    required: true,
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
  temperature: string;

  @Prop({
    type: String,
    default: null,
  })
  age: string;

  @Prop({
    type: Number,
    default: null,
  })
  weight: number;

  @Prop({
    type: String,
    default: null,
  })
  anamnesis: string;

  @Prop({
    type: String,
    default: null,
  })
  diagnosis: string;

  @Prop({
    type: String,
    default: null,
  })
  action: string;

  @Prop({
    type: String,
    default: null,
  })
  medicalPrescription: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'PetHotel',
    default: null,
  })
  petHotelId: Types.ObjectId;

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
    type: Types.ObjectId,
    ref: 'Appointment',
    default: null,
  })
  appointmentId: Types.ObjectId;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);

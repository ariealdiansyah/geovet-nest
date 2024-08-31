import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type UsersDocument = Users & Document;

@Schema({
  timestamps: true,
})
export class Users {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    default: null,
  })
  username: string;

  @Prop({
    type: String,
    default: null,
  })
  password: string;

  @Prop({
    type: String,
    default: null,
  })
  role: string;

  @Prop({
    type: String,
    default: null,
  })
  fullname: string;

  @Prop({
    type: String,
    default: null,
  })
  nip: string;

  @Prop({
    type: String,
    default: null,
  })
  email: string;

  @Prop({
    type: String,
    default: null,
  })
  phone: string;

  @Prop({
    type: Date,
    default: null,
  })
  birthday: Date;

  @Prop({
    type: String,
    default: null,
  })
  resetToken?: string;

  @Prop({
    type: Date,
    default: null,
  })
  resetTokenExpiry?: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

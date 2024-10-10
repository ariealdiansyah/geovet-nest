import { Type } from 'class-transformer';
import { IsDate, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAppointmentDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @IsMongoId()
  @IsNotEmpty()
  petId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  customerId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  context: string;
}

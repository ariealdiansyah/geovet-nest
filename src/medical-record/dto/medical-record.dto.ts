import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { CreateAppointmentDto } from 'src/appointment/dto/appointment.dto';
import { CreatePetHotelDto } from 'src/pet-hotel/dto/pet-hotel.dto';
import { CreateTransactionDto } from 'src/transaction/dto/transaction.dto';

export class CreateMedicalRecordDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  medicalDate: Date;

  @IsString()
  @IsNotEmpty()
  medicalNumber: string;

  @IsMongoId()
  @IsNotEmpty()
  petId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  customerId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  age: string;

  @IsString()
  @IsOptional()
  temperature: string;

  @IsString()
  @IsOptional()
  weight: string;

  @IsString()
  @IsOptional()
  anamnesis: string;

  @IsString()
  @IsOptional()
  diagnosis: string;

  @IsString()
  @IsOptional()
  action: string;

  @IsString()
  @IsOptional()
  medicalPrescription: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePetHotelDto)
  petHotel?: CreatePetHotelDto;

  @IsBoolean()
  @IsOptional()
  hasTransaction: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTransactionDto)
  transaction?: CreateTransactionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAppointmentDto)
  appointment?: CreateAppointmentDto;
}

export class UpdateMedicalRecordDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  medicalDate: Date;

  @IsString()
  @IsOptional()
  medicalNumber: string;

  @IsMongoId()
  @IsNotEmpty()
  petId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  customerId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  age: string;

  @IsString()
  @IsNotEmpty()
  temperature: string;

  @IsString()
  @IsNotEmpty()
  weight: string;

  @IsString()
  @IsNotEmpty()
  anamnesis: string;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsOptional()
  medicalPrescription: string;

  @IsMongoId()
  @IsOptional()
  transactionId: Types.ObjectId;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePetHotelDto)
  petHotel?: CreatePetHotelDto;

  // @IsBoolean()
  // @IsOptional()
  // hasTransaction: boolean;

  // @IsOptional()
  // @ValidateNested()
  // @Type(() => CreateTransactionDto)
  // transaction?: CreateTransactionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAppointmentDto)
  appointment?: CreateAppointmentDto;
}

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
  @IsNotEmpty()
  medicalPrescription: string;

  //   @IsMongoId()
  //   @IsOptional()
  //   petHotelId: Types.ObjectId;

  @IsBoolean()
  @IsOptional()
  hasTransaction: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTransactionDto)
  transaction?: CreateTransactionDto;
}

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose, { Types } from 'mongoose';
import { CreateTransactionDto } from 'src/transaction/dto/transaction.dto';

export class CreatePetHotelDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  checkinDate: Date;

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
  healthStatus: string;

  @IsString()
  @IsNotEmpty()
  healthInfo: string;

  @IsNumber()
  @IsOptional()
  duration: number;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @IsString()
  @IsNotEmpty()
  roomType: string;

  @IsString()
  @IsOptional()
  codeString: string;
}

export class ExitPetHotelDto {
  @IsMongoId()
  @IsNotEmpty()
  _id: mongoose.Types.ObjectId;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  checkoutDate: Date;

  @IsBoolean()
  @IsOptional()
  hasTransaction: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTransactionDto)
  transaction?: CreateTransactionDto;

  @IsNumber()
  @IsOptional()
  totalPrice: number;

  @IsString()
  @IsOptional()
  exitHealthStatus: string;

  @IsString()
  @IsOptional()
  exitTemperature: string;

  @IsNumber()
  @IsOptional()
  exitWeight: number;

  @IsString()
  @IsOptional()
  exitHealthInfo: string;
}

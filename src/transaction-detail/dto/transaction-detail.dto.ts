import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Types } from 'mongoose';
// import { Transform } from 'class-transformer';

export class CreateTransactionDetailDto {
  @IsMongoId()
  @IsOptional()
  transactionId: Types.ObjectId;

  @IsBoolean()
  @IsOptional()
  isMedicine: boolean;

  @IsMongoId()
  @IsOptional()
  medicineId: Types.ObjectId | null;

  @IsBoolean()
  @IsOptional()
  isGroceries: boolean;

  @IsMongoId()
  @IsOptional()
  groceriesId: Types.ObjectId | null;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  // @IsMongoId()
  // @IsOptional()
  // transactionId: string;

  // @IsBoolean()
  // @IsOptional()
  // isGroceries: boolean;

  // @IsMongoId()
  // @IsOptional()
  // groceriesId: string | null;

  // @IsBoolean()
  // @IsOptional()
  // isMedicine: boolean;

  // @IsMongoId()
  // @IsOptional()
  // medicineId: string | null;

  // @IsNumber()
  // @IsNotEmpty()
  // amount: number;
}

import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  medicalNumber: string;

  @IsMongoId()
  @IsNotEmpty()
  customerId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  sex: string;

  @IsString()
  @IsNotEmpty()
  characteristic: string;
}

export class UpdatePetDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  medicalNumber: string;

  @IsMongoId()
  @IsOptional()
  customerId: Types.ObjectId;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  sex: string;

  @IsString()
  @IsOptional()
  characteristic: string;
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  // IsMongoId,
} from 'class-validator';
// import mongoose from 'mongoose';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  nip?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  birthday?: string;
}

export class UpdateUserDto {
  // @IsMongoId()
  // @IsNotEmpty()
  // id: mongoose.Types.ObjectId;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  fullname?: string;

  @IsString()
  @IsOptional()
  nip?: string;

  @IsString()
  @IsOptional()
  email?: string;
}

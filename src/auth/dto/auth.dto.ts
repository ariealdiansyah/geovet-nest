import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordUserDto {
  @IsString()
  @IsOptional()
  token?: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

export class RequestForgotPassword {
  @IsString()
  @IsNotEmpty()
  email?: string;
}

export class UpdatePasswordUserDto {
  @IsNotEmpty()
  @IsMongoId()
  id: mongoose.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

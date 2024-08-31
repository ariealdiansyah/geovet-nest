import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsNumber()
  @IsNotEmpty()
  buyPrice: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  stock: number;

  @IsNumber()
  @IsOptional()
  buyPrice: number;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsString()
  @IsOptional()
  type: string;
}

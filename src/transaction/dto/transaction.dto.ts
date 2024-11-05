/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTransactionDetailDto } from 'src/transaction-detail/dto/transaction-detail.dto';

export class CreateTransactionDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  transactionDate: Date;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @IsNumber()
  @IsOptional()
  discount: number;

  @IsNumber()
  @IsOptional()
  change: number;

  @IsNumber()
  @IsOptional()
  pay: number;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  paymentMethod: string;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionDetailDto)
  transactionDetails: CreateTransactionDetailDto[];
}

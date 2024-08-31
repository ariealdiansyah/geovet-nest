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

  @IsString()
  @IsOptional()
  status: string;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionDetailDto)
  transactionDetails: CreateTransactionDetailDto[];
}

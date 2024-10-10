import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTransactionDto } from './dto/transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createTransaction: CreateTransactionDto) {
    try {
      console.log('Received transactionDetails:', createTransaction);
      return await this.transactionService.create(createTransaction);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getListTransaction(@Query() query: any) {
    return this.transactionService.getByQuery(query);
  }

  @Get('summary')
  async getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.transactionService.getSummary(start, end);
  }

  @Get('today-summary')
  async getTodaySummary() {
    return this.transactionService.getTodaySummary();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getDetailTransaction(@Param('id') id: string) {
    return this.transactionService.getDetailTransaction(id);
  }
}

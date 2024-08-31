import { Controller } from '@nestjs/common';
import { TransactionDetailService } from './transaction-detail.service';

@Controller('transaction-detail')
export class TransactionDetailController {
  constructor(
    private readonly transactionDetailService: TransactionDetailService,
  ) {}
}

import { Logger, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction, TransactionSchema } from './schema/transaction.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionDetailModule } from 'src/transaction-detail/transaction-detail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    TransactionDetailModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, Logger],
  exports: [TransactionService],
})
export class TransactionModule {}

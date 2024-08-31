import { Logger, Module } from '@nestjs/common';
import { TransactionDetailService } from './transaction-detail.service';
import { TransactionDetailController } from './transaction-detail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TransactionDetail,
  TransactionDetailSchema,
} from './schema/transaction-detail.schema';
import { GroceriesModule } from 'src/groceries/groceries.module';
import { MedicineModule } from 'src/medicine/medicine.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionDetail.name, schema: TransactionDetailSchema },
    ]),
    GroceriesModule,
    MedicineModule,
  ],
  controllers: [TransactionDetailController],
  providers: [TransactionDetailService, Logger],
  exports: [TransactionDetailService],
})
export class TransactionDetailModule {}

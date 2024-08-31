import { Logger, Module } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordController } from './medical-record.controller';
import {
  MedicalRecord,
  MedicalRecordSchema,
} from './schema/medical-record.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PetModule } from 'src/pet/pet.module';
import { CustomersModule } from 'src/customers/customers.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
    ]),
    PetModule,
    CustomersModule,
    TransactionModule,
  ],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService, Logger],
})
export class MedicalRecordModule {}

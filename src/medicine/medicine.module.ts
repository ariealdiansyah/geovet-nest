import { Logger, Module } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { Medicine, MedicineSchema } from './schema/medicine.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Medicine.name, schema: MedicineSchema },
    ]),
  ],
  controllers: [MedicineController],
  providers: [MedicineService, Logger],
  exports: [MedicineService],
})
export class MedicineModule {}

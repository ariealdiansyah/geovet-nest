import { Logger, Module } from '@nestjs/common';
import { PetHotelService } from './pet-hotel.service';
import { PetHotelController } from './pet-hotel.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PetHotel, PetHotelSchema } from './schema/pet-hotel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PetHotel.name, schema: PetHotelSchema },
    ]),
  ],
  controllers: [PetHotelController],
  providers: [PetHotelService, Logger],
  exports: [PetHotelService],
})
export class PetHotelModule {}

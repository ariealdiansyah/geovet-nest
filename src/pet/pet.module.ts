import { Logger, Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pet, PetSchema } from './schema/pet.schema';
import { CustomersModule } from 'src/customers/customers.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pet.name, schema: PetSchema }]),
    CustomersModule,
  ],
  controllers: [PetController],
  providers: [PetService, Logger],
  exports: [PetService],
})
export class PetModule {}

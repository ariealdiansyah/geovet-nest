import { Logger, Module } from '@nestjs/common';
import { GroceriesService } from './groceries.service';
import { GroceriesController } from './groceries.controller';
import { Groceries, GroceriesSchema } from './schema/groceries.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Groceries.name, schema: GroceriesSchema },
    ]),
  ],
  controllers: [GroceriesController],
  providers: [GroceriesService, Logger],
  exports: [GroceriesService],
})
export class GroceriesModule {}

import { Module } from '@nestjs/common';
import { GroomingService } from './grooming.service';
import { GroomingController } from './grooming.controller';

@Module({
  controllers: [GroomingController],
  providers: [GroomingService],
})
export class GroomingModule {}

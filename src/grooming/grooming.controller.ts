import { Controller } from '@nestjs/common';
import { GroomingService } from './grooming.service';

@Controller('grooming')
export class GroomingController {
  constructor(private readonly groomingService: GroomingService) {}
}

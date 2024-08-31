import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateMedicalRecordDto } from './dto/medical-record.dto';

@Controller('medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createMedical: CreateMedicalRecordDto) {
    // update soon
    return createMedical;
  }
}

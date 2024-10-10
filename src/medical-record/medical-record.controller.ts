import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateMedicalRecordDto } from './dto/medical-record.dto';

@Controller('medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createMedical: CreateMedicalRecordDto) {
    return await this.medicalRecordService.create(createMedical);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getPet(@Query() query: any) {
    return await this.medicalRecordService.getByQuery(query);
  }
}

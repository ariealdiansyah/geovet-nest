import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
} from './dto/medical-record.dto';

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

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getDetail(@Param('id') id: string) {
    return await this.medicalRecordService.getDetail(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateMedicalRecord: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordService.update(id, updateMedicalRecord);
  }
}

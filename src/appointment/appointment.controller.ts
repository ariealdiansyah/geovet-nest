import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAppointmentDto } from './dto/appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('')
  async getAppointment(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const today = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(today.getFullYear(), today.getMonth(), 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return this.appointmentService.getAppointmentThisMonth(start, end);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createAppointment: CreateAppointmentDto) {
    try {
      return await this.appointmentService.create(createAppointment);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }
}

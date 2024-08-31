import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { CreateMedicineDto, UpdateMedicineDto } from './dto/medicine.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createMedicine: CreateMedicineDto) {
    return this.medicineService.create(createMedicine);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getCustomer(@Query() query: any) {
    return await this.medicineService.getByQuery(query);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async getAllCustomer() {
    return await this.medicineService.getAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getPetByCustomerId(@Param('id') id: string) {
    return await this.medicineService.getItemById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateMedicine: UpdateMedicineDto,
  ) {
    return await this.medicineService.update(id, updateMedicine);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string) {
    return await this.medicineService.remove(id);
  }
}

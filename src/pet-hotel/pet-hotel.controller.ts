import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PetHotelService } from './pet-hotel.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePetHotelDto } from './dto/pet-hotel.dto';

@Controller('pet-hotel')
export class PetHotelController {
  constructor(private readonly petHotelService: PetHotelService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createData: CreatePetHotelDto) {
    return await this.petHotelService.create(createData);
  }
}

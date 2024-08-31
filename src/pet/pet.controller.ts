import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto, UpdatePetDto } from './dto/pet.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createPet: CreatePetDto) {
    return this.petService.create(createPet);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getPet(@Query() query: any) {
    return await this.petService.getByQuery(query);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async getAllPet() {
    return await this.petService.getAll();
  }

  @Get(':customerId')
  @UseGuards(AuthGuard('jwt'))
  async getPetByCustomerId(@Param('customerId') id: string) {
    return await this.petService.getListPetByCustomerId(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updatePet: UpdatePetDto) {
    return this.petService.update(id, updatePet);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.petService.remove(id);
  }
}

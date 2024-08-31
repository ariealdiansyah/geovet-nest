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
import { GroceriesService } from './groceries.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateItemDto, UpdateItemDto } from './dto/groceries.dto';

@Controller('groceries')
export class GroceriesController {
  constructor(private readonly groceriesService: GroceriesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createItem: CreateItemDto) {
    return this.groceriesService.create(createItem);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getCustomer(@Query() query: any) {
    return await this.groceriesService.getByQuery(query);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async getAllCustomer() {
    return await this.groceriesService.getAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getPetByCustomerId(@Param('id') id: string) {
    return await this.groceriesService.getItemById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateItem: UpdateItemDto) {
    return await this.groceriesService.update(id, updateItem);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string) {
    return await this.groceriesService.remove(id);
  }
}

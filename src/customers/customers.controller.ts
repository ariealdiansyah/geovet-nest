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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createCustomer: CreateCustomerDto) {
    return this.customersService.create(createCustomer);
  }

  // @Get()
  // @UseGuards(AuthGuard('jwt'))
  // async getCustomer(@Query() query: any) {
  //   if (query.all) {
  //     return await this.customersService.getAll();
  //   }
  //   return await this.customersService.getByQuery(query);
  // }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getCustomer(@Query() query: any) {
    return await this.customersService.getByQuery(query);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async getAllCustomer() {
    return await this.customersService.getAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getDetailCustomer(@Param('id') id: string) {
    return await this.customersService.getCustomerById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateCustomer: UpdateCustomerDto,
  ) {
    return await this.customersService.update(id, updateCustomer);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string) {
    return await this.customersService.remove(id);
  }
}

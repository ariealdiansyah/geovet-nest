import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Customers } from './schema/customer.schema';
import mongoose, { Model } from 'mongoose';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customers.name)
    private customerModel: Model<Customers>,
    protected logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
  ) {}

  async create(createCustomer: CreateCustomerDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    if (!createCustomer) {
      this.logger.warn('Invalid query parameters', createCustomer);
      throw new BadRequestException('User Data are required');
    }

    const existingData = await this.customerModel.findOne({
      phone: createCustomer.phone,
    });

    if (existingData) {
      throw new ConflictException('Account Already exists');
    }

    const customer = new this.customerModel(createCustomer);
    const res = await customer.save({ validateBeforeSave: true });

    if (res && session) {
      session.commitTransaction();
      session.endSession();
      return {
        message: 'Sukses mendaftarkan pelanggan baru',
      };
    } else {
      session.abortTransaction();
      session.endSession();
      throw new InternalServerErrorException('Erroe Create Customer Data');
    }
  }

  async getAll() {
    const res = await this.customerModel.find().exec();

    if (res === null || res === undefined) {
      throw new InternalServerErrorException(
        'Something wrong, we will fix soon',
      );
    }

    return res;
  }

  async getByQuery(@Query() query: any) {
    const { rowsPerPage = 10, page = 1, filter = '' } = query;

    const filterRegex = new RegExp(filter, 'i');
    const filterQuery = {
      $or: [
        { name: filterRegex },
        { phone: filterRegex },
        { address: filterRegex },
      ],
    };

    const [list, total] = await Promise.all([
      this.customerModel
        .find(filterQuery)
        .skip((parseInt(page) - 1) * parseInt(rowsPerPage))
        .limit(parseInt(rowsPerPage, 10))
        // .populate('customerId') // add this if need populate data from other collection
        .exec(),
      this.customerModel.countDocuments(filterQuery).exec(),
    ]);

    if (!page || !rowsPerPage) {
      this.logger.warn('Invalid query parameters', query);
      throw new BadRequestException('Page and rowsPerPage are required');
    }

    const pagination = {
      page: parseInt(page),
      rowsPerPage: parseInt(rowsPerPage),
      total,
    };

    return { list, pagination };
  }

  async getCustomerById(id: string) {
    const res = await this.customerModel.findById(id).lean().exec();
    if (!res) {
      throw new NotFoundException('Customer Not Found');
    }
    return res;
  }

  async update(id: string, customer: UpdateCustomerDto) {
    try {
      const res = await this.customerModel.findByIdAndUpdate(
        {
          _id: id as unknown as mongoose.Types.ObjectId,
        },
        {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          memberType: customer.memberType,
        },
        { new: true },
      );

      if (res) {
        return res;
      } else {
        throw new InternalServerErrorException('Error Update Customer');
      }
    } catch (error) {
      console.error('error', error);
      throw new InternalServerErrorException('Error Update Customer');
    }
  }

  async remove(id: string) {
    const res = await this.customerModel.findByIdAndDelete(
      {
        _id: id as unknown as mongoose.Types.ObjectId,
      },
      { new: true },
    );
    if (res) {
      return {
        message: 'Sukses hapus pelanggan',
      };
    } else {
      throw new NotFoundException('Customer not found');
    }
  }
}

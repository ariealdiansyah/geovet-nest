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
import { Groceries } from './schema/groceries.schema';
import mongoose, { Model } from 'mongoose';
import { CreateItemDto, UpdateItemDto } from './dto/groceries.dto';

@Injectable()
export class GroceriesService {
  constructor(
    @InjectModel(Groceries.name)
    private itemModel: Model<Groceries>,
    private logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
  ) {}

  async create(createItem: CreateItemDto) {
    if (!createItem) {
      this.logger.warn('Invalid query parameters', createItem);
      throw new BadRequestException('Invalid Request');
    }

    const existingData = await this.itemModel.findOne({
      name: createItem.name,
      price: createItem.price,
    });

    if (existingData) {
      throw new ConflictException('Item Already exists');
    }

    const customer = new this.itemModel(createItem);
    const res = await customer.save({ validateBeforeSave: true });

    if (res) {
      return {
        message: 'Sukses mendaftarkan item baru',
      };
    } else {
      throw new InternalServerErrorException('Erroe Create Item Data');
    }
  }

  async getAll() {
    const res = await this.itemModel.find().exec();

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
    // const isNumericFilter = !isNaN(Number(filter));

    const filterQuery = {
      $or: [
        { name: filterRegex },
        { type: filterRegex },
        // ...(isNumericFilter
        //   ? [{ price: Number(filter) }]
        //   : [{ price: filterRegex }]),
      ],
    };

    const [list, total] = await Promise.all([
      this.itemModel
        .find(filterQuery)
        .skip((page - 1) * rowsPerPage)
        .limit(parseInt(rowsPerPage, 10))
        .sort({
          createdAt: -1,
        })
        .exec(),
      this.itemModel.countDocuments(filterQuery).exec(),
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

  async getItemById(id: string) {
    const res = await this.itemModel.findById(id).lean().exec();
    if (!res) {
      throw new NotFoundException('Item Not Found');
    }
    return res;
  }

  async update(id: string, item: UpdateItemDto) {
    const res = await this.itemModel.findByIdAndUpdate(
      {
        _id: id as unknown as mongoose.Types.ObjectId,
      },
      {
        name: item.name,
        stock: item.stock,
        buyPrice: item.buyPrice,
        price: item.price,
        type: item.type,
        $inc: { __v: 1 },
      },
      { new: true },
    );

    if (res) {
      return res;
    } else {
      throw new InternalServerErrorException('Error Update Item');
    }
  }

  async remove(id: string) {
    const res = await this.itemModel.findByIdAndDelete(
      {
        _id: id as unknown as mongoose.Types.ObjectId,
      },
      { new: true },
    );
    if (res) {
      return {
        message: 'Sukses hapus item',
      };
    } else {
      throw new NotFoundException('Item not found');
    }
  }
}

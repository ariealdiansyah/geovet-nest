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
import { Medicine } from './schema/medicine.schema';
import mongoose, { Model } from 'mongoose';
import { CreateMedicineDto, UpdateMedicineDto } from './dto/medicine.dto';

@Injectable()
export class MedicineService {
  constructor(
    @InjectModel(Medicine.name)
    private medicineModel: Model<Medicine>,
    private logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
  ) {}

  async create(createMedicine: CreateMedicineDto) {
    if (!createMedicine) {
      this.logger.warn('Invalid query parameters', createMedicine);
      throw new BadRequestException('Invalid Request');
    }

    const existingData = await this.medicineModel.findOne({
      name: createMedicine.name,
      price: createMedicine.price,
    });

    if (existingData) {
      throw new ConflictException('Medicine Already exists');
    }

    const customer = new this.medicineModel(createMedicine);
    const res = await customer.save({ validateBeforeSave: true });

    if (res) {
      return {
        message: 'Sukses mendaftarkan obat baru',
      };
    } else {
      throw new InternalServerErrorException('Erroe Create Medicine Data');
    }
  }

  async getAll() {
    const res = await this.medicineModel.find().exec();

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

    const [data, total] = await Promise.all([
      this.medicineModel
        .find(filterQuery)
        .skip((page - 1) * rowsPerPage)
        .limit(parseInt(rowsPerPage, 10))
        .exec(),
      this.medicineModel.countDocuments(filterQuery).exec(),
    ]);

    if (!page || !rowsPerPage) {
      this.logger.warn('Invalid query parameters', query);
      throw new BadRequestException('Page and rowsPerPage are required');
    }

    return { data, total };
  }

  async getItemById(id: string) {
    const res = await this.medicineModel.findById(id);
    if (!res) {
      throw new NotFoundException('Medicine Not Found');
    }
    return res;
  }

  async update(id: string, item: UpdateMedicineDto) {
    const res = await this.medicineModel.findByIdAndUpdate(
      {
        _id: id as unknown as mongoose.Types.ObjectId,
      },
      {
        name: item.name,
        price: item.price,
        type: item.type,
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
    const res = await this.medicineModel.findByIdAndDelete(
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

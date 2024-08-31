import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CreatePetDto, UpdatePetDto } from './dto/pet.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Pet } from './schema/pet.schema';
import mongoose, { Model } from 'mongoose';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class PetService {
  constructor(
    @InjectModel(Pet.name)
    private petModel: Model<Pet>,
    protected logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
    protected customerService: CustomersService,
  ) {}

  async create(createPet: CreatePetDto) {
    if (!createPet) {
      this.logger.warn('Invalid query parameters', createPet);
      throw new BadRequestException('Bad Request');
    }

    const existingData = await this.petModel
      .findOne({
        name: createPet.name,
        type: createPet.type,
        customerId: createPet.customerId,
      })
      .exec();

    if (existingData) {
      throw new ConflictException('Pet Already exists');
    }

    const customer = new this.petModel(createPet);
    const res = await customer.save({ validateBeforeSave: true });

    if (res) {
      return {
        message: 'Sukses mendaftarkan hewan baru',
      };
    } else {
      throw new InternalServerErrorException('Erroe Create Pet Data');
    }
  }

  async getAll() {
    const res = await this.petModel.find().exec();

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
        { type: filterRegex },
        { sex: filterRegex },
        { characteristic: filterRegex },
        { medicalNumber: filterRegex },
      ],
    };

    const [list, total] = await Promise.all([
      this.petModel
        .find(filterQuery)
        .skip((page - 1) * rowsPerPage)
        .limit(parseInt(rowsPerPage, 10))
        .populate({
          path: 'customerId',
          select: 'name address',
        })
        .lean()
        .exec(),
      this.petModel.countDocuments(filterQuery).exec(),
    ]);

    if (!page || !rowsPerPage) {
      this.logger.warn('Invalid query parameters', query);
      throw new BadRequestException('Page and rowsPerPage are required');
    }

    const modifiedPets = list.map((pet) => ({
      ...pet,
      customer: pet.customerId,
      customerId: undefined,
    }));

    return { list: modifiedPets, total };
  }

  async getPetById(id: string) {
    const res = await this.petModel.findById(id);
    if (!res) {
      throw new NotFoundException('Customer Not Found');
    }
    return res;
  }

  async getListPetByCustomerId(id: string) {
    const res = await this.petModel
      .find({
        customerId: id as unknown as mongoose.Types.ObjectId,
      })
      .populate({
        path: 'customerId',
        select: 'name address',
      })
      .lean()
      .exec();

    if (!res || res.length < 1) {
      throw new NotFoundException(
        'Pelanggan ini belum memiliki hewan peliharaan apapun',
      );
    }

    const modifiedPets = res.map((pet) => ({
      ...pet,
      customer: pet.customerId,
      customerId: undefined,
    }));

    return modifiedPets;
  }

  async update(id: string, pet: UpdatePetDto) {
    const res = await this.petModel.findByIdAndUpdate(
      {
        _id: id as unknown as mongoose.Types.ObjectId,
      },
      {
        name: pet.name,
        medicalNumber: pet.medicalNumber,
        customerId: pet.customerId,
        type: pet.type,
        sex: pet.sex,
        characteristic: pet.characteristic,
      },
      { new: true },
    );

    if (res) {
      return res;
    } else {
      throw new InternalServerErrorException('Error Update Customer');
    }
  }

  async remove(id: string) {
    const res = await this.petModel.findByIdAndDelete(
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

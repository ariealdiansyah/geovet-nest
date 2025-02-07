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
import mongoose, { Model, Types } from 'mongoose';
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

    const newPet = {
      ...createPet,
      customerId: new Types.ObjectId(createPet.customerId),
    };

    const pets = new this.petModel(newPet);
    const res = await pets.save({ validateBeforeSave: true });

    if (res) {
      return {
        message: 'Sukses mendaftarkan hewan baru',
      };
    } else {
      throw new InternalServerErrorException('Erroe Create Pet Data');
    }
  }

  async getAll() {
    const res = await this.petModel
      .find()
      .select('medicalNumber name type sex characteristic')
      .populate({
        path: 'customerId',
        select: 'name address phone',
      })
      .exec();

    if (res === null || res === undefined) {
      throw new InternalServerErrorException(
        'Something wrong, we will fix soon',
      );
    }

    return res;
  }

  async getByQuery(@Query() query: any) {
    const { rowsPerPage = 10, page = 1, filter = '' } = query;

    if (!page || !rowsPerPage) {
      this.logger.warn('Invalid query parameters', query);
      throw new BadRequestException('Page and rowsPerPage are required');
    }

    const filterRegex = new RegExp(filter, 'i');

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { name: filterRegex },
            { type: filterRegex },
            { sex: filterRegex },
            { characteristic: filterRegex },
            { medicalNumber: filterRegex },
            { 'customer.name': filterRegex },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    if (parseInt(rowsPerPage) > 0) {
      pipeline.push(
        { $skip: (parseInt(page) - 1) * parseInt(rowsPerPage) },
        { $limit: parseInt(rowsPerPage) },
      );
    }

    const [list, total] = await Promise.all([
      this.petModel.aggregate(pipeline).exec(),
      this.petModel
        .aggregate([
          ...pipeline,
          {
            $count: 'total',
          },
        ])
        .exec()
        .then((res) => (res[0] ? res[0].total : 0)),
    ]);

    // const modifiedPets = list.map((pet) => ({
    // ...pet,
    // customer: pet.customerId,
    // customerId: undefined,
    // }));

    const pagination = {
      page: parseInt(page),
      rowsPerPage: parseInt(rowsPerPage),
      total,
    };

    return { list, pagination };
  }

  async getPetById(id: string) {
    const res = await this.petModel
      .findById(id)
      .populate({
        path: 'customerId',
        select: 'name address',
      })
      .lean()
      .exec();
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
        customerId: new Types.ObjectId(pet.customerId),
        type: pet.type,
        sex: pet.sex,
        characteristic: pet.characteristic,
        $inc: { __v: 1 },
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

  async generateMedicalNumber(id: string) {
    const petData = await this.petModel.findById(id).exec();
    if (petData.medicalNumber) {
      throw new ConflictException('Medical number already exist');
    }
    const getNumber = await this.countPetsWithTypeAndMedicalNumber(
      petData.type,
    );
    const number = getNumber + 1;
    const medNumber = petData.type + number.toString().padStart(4, '0');
    petData.medicalNumber = medNumber;
    const res = petData.save();
    return res;
  }

  async countPetsWithTypeAndMedicalNumber(type: string) {
    const dataExist = await this.petModel.find({ type });
    if (!dataExist || dataExist.length === 0) {
      throw new NotFoundException('Please make sure the pet is exist');
    }
    return this.petModel
      .countDocuments({
        type: type,
        medicalNumber: { $ne: null },
      })
      .exec();
  }
}

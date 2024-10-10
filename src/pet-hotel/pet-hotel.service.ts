import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { PetHotel } from './schema/pet-hotel.schema';
import mongoose, { Model } from 'mongoose';
import { CreatePetHotelDto } from './dto/pet-hotel.dto';

@Injectable()
export class PetHotelService {
  constructor(
    @InjectModel(PetHotel.name)
    private petHotelModel: Model<PetHotel>,
    protected logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
  ) {}

  async create(
    createData: CreatePetHotelDto,
    ses: mongoose.ClientSession | null = null,
  ) {
    let session: any;
    if (!ses) {
      session = await this.connection.startSession();
      session.startTransaction();
    } else {
      session = ses;
    }

    try {
      const petHotel = new this.petHotelModel(createData);
      const res = await petHotel.save({ validateBeforeSave: true });
      if (!ses) {
        await session.commitTransaction();
      }
      return {
        _id: res._id,
        message: 'Sukses menambahkan data inap baru',
      };
    } catch (error) {
      if (!ses) {
        await session.abortTransaction();
      }
      this.logger.warn(error);
      throw new InternalServerErrorException('Failed to create pet hotel');
    } finally {
      if (!ses) {
        session.endSession();
      }
    }
  }
}

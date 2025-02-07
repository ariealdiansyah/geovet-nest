import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Appointment } from './schema/appointment.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<Appointment>,
    protected logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
  ) {}

  async create(
    createData: CreateAppointmentDto,
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
      const data = {
        ...createData,
        petId: new Types.ObjectId(createData.petId),
        customerId: new Types.ObjectId(createData.customerId),
      };
      const appointment = new this.appointmentModel(data);
      const res = await appointment.save({ validateBeforeSave: true });
      return {
        _id: res._id,
        message: 'Sukses menambahkan data appointment baru',
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

  async getAppointmentThisMonth(startDate: Date, endDate: Date) {
    const appointment = await this.appointmentModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('customerId petId')
      .lean()
      .exec();
    return appointment;
  }
}

import {
  // BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MedicalRecord } from './schema/medical-record.schema';
import mongoose, { Model } from 'mongoose';
import { PetService } from 'src/pet/pet.service';
import { CustomersService } from 'src/customers/customers.service';
import { TransactionService } from 'src/transaction/transaction.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
} from './dto/medical-record.dto';
import { PetHotelService } from 'src/pet-hotel/pet-hotel.service';
import { AppointmentService } from 'src/appointment/appointment.service';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectModel(MedicalRecord.name)
    private medicalModel: Model<MedicalRecord>,
    protected logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
    protected petService: PetService,
    protected customerService: CustomersService,
    protected transactionService: TransactionService,
    protected petHotelService: PetHotelService,
    protected appointmentService: AppointmentService,
  ) {}

  async create(createData: CreateMedicalRecordDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      //#region Find Customer
      const customerData = await this.customerService.getCustomerById(
        createData.customerId as unknown as string,
      );

      //#region Find Pet
      const petData = await this.petService.getPetById(
        createData.petId as unknown as string,
      );

      if (!customerData || !petData) {
        throw new NotFoundException('Either customer or pet is not exist');
      } else {
        createData.petId = petData._id;
        createData.customerId = customerData._id;
      }

      const createMedical = new this.medicalModel(createData);
      //   #region Add Transaction
      if (createData.hasTransaction && createData.transaction) {
        const createTransaction = await this.transactionService.create(
          createData.transaction,
          session,
        );

        createMedical.transactionId = createTransaction._id;
      }

      //   #region Add Pet Hotel
      if (createData.petHotel) {
        const dataPetHotel = {
          ...createData.petHotel,
          transactionId: createMedical.transactionId ?? null,
          hasTransaction: Boolean(createMedical.transactionId),
        };

        const createPetHotel = await this.petHotelService.create(
          dataPetHotel,
          session,
        );

        createMedical.petHotelId = createPetHotel._id;
      }

      //   #region Add Appointment
      if (createData.appointment) {
        const createAppointment = await this.appointmentService.create(
          createData.appointment,
          session,
        );

        createMedical.appointmentId = createAppointment._id;
      }

      const res = await createMedical.save({ session });
      await session.commitTransaction();
      return res;
    } catch (error) {
      await session.abortTransaction();
      this.logger.warn(error);
      throw new InternalServerErrorException('Failed to create transaction');
    } finally {
      session.endSession();
    }
  }

  async getByQuery(@Query() query: any) {
    const {
      rowsPerPage = 10,
      page = 1,
      filter = '',
      startDate,
      endDate,
    } = query;

    // Convert filter to a regex for case-insensitive matching
    const filterRegex = new RegExp(filter, 'i');

    // Build the date range filter if both dates are provided
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // MongoDB Aggregation Pipeline
    const pipeline: any[] = [
      // Match stage for filtering by date
      { $match: { ...dateFilter } },

      // Lookup to populate customer details
      {
        $lookup: {
          from: 'customers', // Collection name in MongoDB
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true, // Allow results with no matching customer
        },
      },

      // Lookup to populate pet details
      {
        $lookup: {
          from: 'pets', // Collection name in MongoDB
          localField: 'petId',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $unwind: {
          path: '$pet',
          preserveNullAndEmptyArrays: true, // Allow results with no matching pet
        },
      },

      // Filter based on customer name or pet name using regex
      {
        $match: {
          $or: [{ 'customer.name': filterRegex }, { 'pet.name': filterRegex }],
        },
      },

      // Lookup to populate transaction details
      {
        $lookup: {
          from: 'transactions',
          localField: 'transactionId',
          foreignField: '_id',
          as: 'transaction',
        },
      },
      {
        $unwind: {
          path: '$transaction',
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup to populate pet hotel details
      {
        $lookup: {
          from: 'pethotels',
          localField: 'petHotelId',
          foreignField: '_id',
          as: 'petHotel',
        },
      },
      {
        $unwind: {
          path: '$petHotel',
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup to populate appointment details
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointmentId',
          foreignField: '_id',
          as: 'appointment',
        },
      },
      {
        $unwind: {
          path: '$appointment',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    if (parseInt(rowsPerPage) > 0) {
      pipeline.push(
        // Pagination: skip and limit stages
        { $skip: (parseInt(page) - 1) * parseInt(rowsPerPage) },
        { $limit: parseInt(rowsPerPage) },
      );
    }

    // Fetch the data and total count using aggregation
    const [list, total] = await Promise.all([
      this.medicalModel.aggregate(pipeline).exec(),
      this.medicalModel.countDocuments(dateFilter).exec(),
    ]);

    // Pagination response
    const pagination = {
      page: parseInt(page),
      rowsPerPage: parseInt(rowsPerPage),
      total,
    };

    return { list, pagination };
  }

  async getDetail(id: string) {
    const medicalRecord = await this.medicalModel
      .findById(id)
      .populate('petId customerId transactionId appointmentId petHotelId')
      .lean()
      .exec();

    const petData = {
      ...medicalRecord.petId,
      createdAt: undefined,
      updatedAt: undefined,
      __v: undefined,
    };

    const customerData = {
      ...medicalRecord.customerId,
      createdAt: undefined,
      updatedAt: undefined,
      __v: undefined,
    };

    const transactionDetail = medicalRecord.transactionId
      ? await this.transactionService.getDetailTransaction(
          medicalRecord.transactionId._id as unknown as string,
        )
      : undefined;

    const transactionId = transactionDetail
      ? {
          ...transactionDetail,
          createdAt: undefined,
          updatedAt: undefined,
          __v: undefined,
        }
      : undefined;

    const appointmentData = {
      ...medicalRecord.appointmentId,
      createdAt: undefined,
      updatedAt: undefined,
      __v: undefined,
    };

    const petHotelData = {
      ...medicalRecord.petHotelId,
      createdAt: undefined,
      updatedAt: undefined,
      __v: undefined,
    };

    const data = {
      ...medicalRecord,
      createdAt: undefined,
      updatedAt: undefined,
      __v: undefined,
      pet: petData,
      petId: undefined,
      customer: customerData,
      customerId: undefined,
      transaction: transactionId,
      transactionId: undefined,
      appointment: appointmentData,
      appointmentId: undefined,
      petHotel: petHotelData,
      petHotelId: undefined,
    };

    return data;
  }

  async update(id: string, updateMedicalRecord: UpdateMedicalRecordDto) {
    return `${id} + ${JSON.stringify(updateMedicalRecord)}`;
  }
}

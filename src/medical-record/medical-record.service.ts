import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MedicalRecord } from './schema/medical-record.schema';
import mongoose, { Model } from 'mongoose';
import { PetService } from 'src/pet/pet.service';
import { CustomersService } from 'src/customers/customers.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { CreateMedicalRecordDto } from './dto/medical-record.dto';

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
  ) {}

  async create(createData: CreateMedicalRecordDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const customerData = await this.customerService.getCustomerById(
        createData.customerId as unknown as string,
      );

      const petData = await this.petService.getPetById(
        createData.petId as unknown as string,
      );

      if (!customerData || !petData) {
        throw new NotFoundException('Either customer or pet is not exist');
      }

      const createMedical = new this.medicalModel(createData);
      //   #region Add Transaction
      if (createData.hasTransaction && createData.transaction) {
        const trxId = await this.transactionService.create(
          createData.transaction,
        );

        createMedical.transactionId = trxId._id;
      }
      const res = await createMedical.save({ session });

      if (res) {
        await session.commitTransaction();
      }

      return res;
    } catch (error) {
      await session.abortTransaction();
      this.logger.warn(error);
      throw new InternalServerErrorException('Failed to create transaction');
    } finally {
      session.endSession();
    }
  }
}

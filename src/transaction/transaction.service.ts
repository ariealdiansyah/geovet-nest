import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Transaction } from './schema/transaction.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateTransactionDto } from './dto/transaction.dto';
import { TransactionDetailService } from 'src/transaction-detail/transaction-detail.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<Transaction>,
    protected logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
    protected transactionDetailService: TransactionDetailService,
  ) {
    this.logger = new Logger(TransactionService.name);
  }

  async create(dataTransaction: CreateTransactionDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const { transactionDate, totalAmount, status, transactionDetails } =
        dataTransaction;
      const newTransaction = new this.transactionModel({
        transactionDate,
        totalAmount,
        status,
      });
      const createdTransaction = await newTransaction.save({ session });
      let totalTransactionAmount = 0;
      for (const detail of transactionDetails) {
        const total = await this.transactionDetailService.create(
          {
            ...detail,
            transactionId: createdTransaction._id as unknown as Types.ObjectId,
          },
          session,
        );
        totalTransactionAmount += total;
      }
      createdTransaction.totalAmount = totalTransactionAmount;
      const res = await createdTransaction.save({ session });
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
    const { rowsPerPage = 10, page = 1, startDate, endDate } = query;

    const filterQuery: any = {};

    if (startDate && endDate) {
      filterQuery.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [list, total] = await Promise.all([
      this.transactionModel
        .find(filterQuery)
        .skip((page - 1) * rowsPerPage)
        .limit(parseInt(rowsPerPage, 10))
        .lean()
        .exec(),
      this.transactionModel.countDocuments(filterQuery).exec(),
    ]);

    return { list, total };
  }

  async getDetailTransaction(id: string) {
    const transaction = await this.transactionModel.findById(id).lean().exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const transactionDetails =
      await this.transactionDetailService.getTransactionDetailByTransactionId(
        id,
      );

    return {
      ...transaction,
      transactionDetails,
    };
  }
}

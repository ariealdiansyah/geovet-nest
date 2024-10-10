import {
  BadRequestException,
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
import { Groceries } from 'src/groceries/schema/groceries.schema';
import { Medicine } from 'src/medicine/schema/medicine.schema';

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

  async create(
    dataTransaction: CreateTransactionDto,
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
      const {
        transactionDate,
        totalAmount,
        discount,
        totalPrice,
        status,
        transactionDetails,
      } = dataTransaction;
      const newTransaction = new this.transactionModel({
        transactionDate,
        totalAmount,
        status,
        totalPrice,
        discount,
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
      if (!ses) {
        await session.commitTransaction();
      }
      return res;
    } catch (error) {
      if (!ses) {
        await session.abortTransaction();
      }
      this.logger.warn(error);
      throw new InternalServerErrorException('Failed to create transaction');
    } finally {
      if (!ses) {
        session.endSession();
      }
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

    const pagination = {
      page: parseInt(page),
      rowsPerPage: parseInt(rowsPerPage),
      total,
    };

    return { list, pagination };
  }

  async getDetailTransaction(id: string) {
    const transaction = await this.transactionModel.findById(id).lean().exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    const objectId = new Types.ObjectId(id);
    const transactionDetails =
      await this.transactionDetailService.getTransactionDetailByTransactionId(
        objectId,
      );

    return {
      ...transaction,
      transactionDetails,
    };
  }

  async getSummary(startDate: Date, endDate: Date) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    const transactions = await this.transactionModel
      .find({
        transactionDate: { $gte: startDate, $lte: endDate },
      })
      .exec();

    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalProfit: 0,
        income: { groceries: 0, medicine: 0 },
        profit: { groceries: 0, medicine: 0 },
        itemsSold: { groceries: 0, medicine: 0 },
        totalTransactions: 0,
      };
    }

    let totalGroceriesIncome = 0;
    let totalMedicineIncome = 0;
    let totalGroceriesProfit = 0;
    let totalMedicineProfit = 0;
    let totalDiscounts = 0;
    let groceriesSold = 0;
    let medicineSold = 0;

    for (const transaction of transactions) {
      const details =
        await this.transactionDetailService.getTransactionDetailByTransactionId(
          transaction._id,
        );

      // Track total discount from each transaction
      totalDiscounts += transaction.discount;

      for (const detail of details) {
        if (detail.isGroceries && detail.groceriesId) {
          const groceryItem = detail.groceriesId as unknown as Groceries;
          totalGroceriesIncome += detail.totalPrice;
          totalGroceriesProfit +=
            (detail.price - groceryItem.buyPrice) * detail.amount;
          groceriesSold += detail.amount;
        } else if (detail.isMedicine && detail.medicineId) {
          const medicineItem = detail.medicineId as unknown as Medicine;
          totalMedicineIncome += detail.totalPrice;
          totalMedicineProfit +=
            (detail.price - medicineItem.buyPrice) * detail.amount;
          medicineSold += detail.amount;
        }
      }
    }

    const totalIncome = totalGroceriesIncome + totalMedicineIncome;

    const totalProfit =
      totalGroceriesProfit + totalMedicineProfit - totalDiscounts;

    return {
      totalIncome,
      totalProfit,
      totalDiscounts,
      income: {
        groceries: totalGroceriesIncome,
        medicine: totalMedicineIncome,
      },
      profit: {
        groceries: totalGroceriesProfit,
        medicine: totalMedicineProfit,
      },
      itemsSold: {
        groceries: groceriesSold,
        medicine: medicineSold,
      },
      totalTransactions: transactions.length,
    };
  }

  async getTodaySummary() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.getSummary(startOfDay, endOfDay);
  }
}

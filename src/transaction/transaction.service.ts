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
        paymentMethod,
      } = dataTransaction;
      const newTransaction = new this.transactionModel({
        transactionDate,
        totalAmount,
        status,
        totalPrice,
        discount,
        paymentMethod,
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
      createdTransaction.totalAmount = totalTransactionAmount - discount;
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
        .skip((parseInt(page) - 1) * parseInt(rowsPerPage))
        .limit(parseInt(rowsPerPage, 10))
        .sort({
          createdAt: -1,
        })
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

    const list = transactionDetails.map((x: any) => {
      return {
        ...x,
        name: x.groceriesId?.name ?? x.medicineId?.name,
      };
    });

    console.log(list);

    return {
      ...transaction,
      transactionDetails: list,
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
        topGroceries: [],
        topMedicine: [],
      };
    }

    let totalGroceriesIncome = 0;
    let totalMedicineIncome = 0;
    let totalGroceriesProfit = 0;
    let totalMedicineProfit = 0;
    let totalDiscounts = 0;
    let groceriesSold = 0;
    let medicineSold = 0;

    const paymentMethodSummary = {
      groceries: { cash: 0, transfer: 0, qris: 0 },
      medicine: { cash: 0, transfer: 0, qris: 0 },
    };

    const groceriesCountMap = new Map<
      string,
      { name: string; quantity: number }
    >();
    const medicineCountMap = new Map<
      string,
      { name: string; quantity: number }
    >();

    for (const transaction of transactions) {
      const details =
        await this.transactionDetailService.getTransactionDetailByTransactionId(
          transaction._id,
        );

      totalDiscounts += transaction.discount;

      for (const detail of details) {
        if (detail.isGroceries && detail.groceriesId) {
          const groceryItem = detail.groceriesId as unknown as Groceries;
          totalGroceriesIncome += detail.totalPrice;
          totalGroceriesProfit +=
            (detail.price - groceryItem.buyPrice) * detail.amount;
          groceriesSold += detail.amount;

          const groceryId = groceryItem._id.toString();
          const groceryName = groceryItem.name;

          if (groceriesCountMap.has(groceryId)) {
            groceriesCountMap.get(groceryId).quantity += detail.amount;
          } else {
            groceriesCountMap.set(groceryId, {
              name: groceryName,
              quantity: detail.amount,
            });
          }
          switch (transaction.paymentMethod) {
            case 'Cash':
              paymentMethodSummary.groceries.cash += detail.totalPrice;
              break;
            case 'tf':
              paymentMethodSummary.groceries.transfer += detail.totalPrice;
              break;
            case 'qris':
              paymentMethodSummary.groceries.qris += detail.totalPrice;
              break;
          }
        } else if (detail.isMedicine && detail.medicineId) {
          const medicineItem = detail.medicineId as unknown as Medicine;
          totalMedicineIncome += detail.totalPrice;
          totalMedicineProfit +=
            (detail.price - medicineItem.buyPrice) * detail.amount;
          medicineSold += detail.amount;

          const medicineId = medicineItem._id.toString();
          const medicineName = medicineItem.name;

          if (medicineCountMap.has(medicineId)) {
            medicineCountMap.get(medicineId).quantity += detail.amount;
          } else {
            medicineCountMap.set(medicineId, {
              name: medicineName,
              quantity: detail.amount,
            });
          }

          switch (transaction.paymentMethod) {
            case 'Cash':
              paymentMethodSummary.medicine.cash += detail.totalPrice;
              break;
            case 'tf':
              paymentMethodSummary.medicine.transfer += detail.totalPrice;
              break;
            case 'qris':
              paymentMethodSummary.medicine.qris += detail.totalPrice;
              break;
          }
        }
      }
    }

    const totalIncome = totalGroceriesIncome + totalMedicineIncome;
    const totalProfit =
      totalGroceriesProfit + totalMedicineProfit - totalDiscounts;
    const halfDiscount = totalDiscounts / 2;
    // Get top 5 groceries by quantity sold
    const topGroceries = Array.from(groceriesCountMap.values()).sort(
      (a, b) => b.quantity - a.quantity,
    );
    // .slice(0, 5);

    // Get top 5 medicines by quantity sold
    const topMedicine = Array.from(medicineCountMap.values()).sort(
      (a, b) => b.quantity - a.quantity,
    );
    // .slice(0, 5);

    return {
      totalIncome,
      totalProfit,
      totalDiscounts,
      totalGroceriesProfit,
      totalMedicineProfit,
      income: {
        groceries: totalGroceriesIncome,
        medicine: totalMedicineIncome,
      },
      profit: {
        groceries: totalGroceriesProfit - halfDiscount,
        medicine: totalMedicineProfit - halfDiscount,
      },
      itemsSold: {
        groceries: groceriesSold,
        medicine: medicineSold,
      },
      totalTransactions: transactions.length,
      topGroceries,
      topMedicine,
      paymentMethodSummary: {
        groceries: paymentMethodSummary.groceries,
        medicine: paymentMethodSummary.medicine,
      },
    };
  }

  async getTodaySummary() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.getSummary(startOfDay, endOfDay);
  }
}

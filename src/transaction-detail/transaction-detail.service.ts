import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { TransactionDetail } from './schema/transaction-detail.schema';
import { CreateTransactionDetailDto } from './dto/transaction-detail.dto';
import { GroceriesService } from 'src/groceries/groceries.service';
import { MedicineService } from 'src/medicine/medicine.service';

@Injectable()
export class TransactionDetailService {
  constructor(
    @InjectModel(TransactionDetail.name)
    private transactionDetailModel: Model<TransactionDetail>,
    protected groceriesService: GroceriesService,
    protected medicineService: MedicineService,
    protected logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
  ) {
    this.logger = new Logger(TransactionDetailService.name);
  }

  async create(
    data: CreateTransactionDetailDto,
    session: mongoose.ClientSession | null = null,
  ) {
    try {
      let price = 0;
      let dataItem: any;
      if (data.isGroceries && data.groceriesId) {
        dataItem = await this.groceriesService.getItemById(
          data.groceriesId as unknown as string,
        );
        if (!dataItem)
          throw new NotFoundException(
            `Groceries item with ID ${data.groceriesId} not found`,
          );
        price = dataItem.price;
      } else if (data.isMedicine && data.medicineId) {
        dataItem = await this.medicineService.getItemById(
          data.medicineId as unknown as string,
        );
        if (!dataItem)
          throw new NotFoundException(
            `Medicine item with ID ${data.medicineId} not found`,
          );
        price = dataItem.price;
      } else {
        throw new BadRequestException(
          'Make sure you pick between pet shop or medicine item',
        );
      }
      const totalPrice = price * data.amount;

      const dataInput = {
        transactionId: data.transactionId,
        isMedicine: data.isMedicine,
        medicineId: data.medicineId,
        isGroceries: data.isGroceries,
        groceriesId: data.groceriesId,
        amount: data.amount,
        price: price,
        totalPrice: totalPrice,
      };

      const transactionDetail = new this.transactionDetailModel(dataInput);
      const res = await transactionDetail.save({ session });
      if (res) {
        if (data.isGroceries) {
          const updateStock = await this.groceriesService.update(
            data.groceriesId as unknown as string,
            {
              ...dataItem,
              stock: dataItem.stock - 1,
            },
          );

          if (!updateStock) {
            throw new InternalServerErrorException('Failed while update stock');
          }
        }
        return totalPrice;
      }
    } catch (error) {
      this.logger.warn(error);
      throw new InternalServerErrorException(
        'Something wrong when adding transaction detail',
      );
    }
  }

  async getDataByTransactionId(trxId: Types.ObjectId) {
    return trxId;
  }

  async getTransactionDetailByTransactionId(id: string) {
    const objectId = new Types.ObjectId(id);

    const res = await this.transactionDetailModel
      .find({ transactionId: objectId })
      .populate({
        path: 'medicineId',
        select: 'name price',
        model: 'Medicine',
      })
      .populate({
        path: 'groceriesId',
        select: 'name price',
        model: 'Groceries',
      })
      .select('amount price totalPrice')
      .lean()
      .exec();

    if (!res || res.length === 0) {
      throw new NotFoundException(`No details found for transaction ID: ${id}`);
    }

    return res;
  }
}
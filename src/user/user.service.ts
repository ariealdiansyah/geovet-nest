import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Users } from './schema/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordUserDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name)
    private userModel: Model<Users>,
    protected logger: Logger,
    @InjectConnection()
    private readonly connection: mongoose.Connection,
  ) {
    this.logger = new Logger(UsersService.name);
  }

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto) {
      this.logger.warn('Invalid query parameters', createUserDto);
      throw new BadRequestException('User Data are required');
    }
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });
    if (existingUser) {
      throw new ConflictException('Account already exists');
    }

    const hashPas = await this.generatePassword(createUserDto.password!);
    createUserDto.password = hashPas;
    const createUser = new this.userModel(createUserDto);
    const res = await createUser.save({ validateBeforeSave: true });
    return {
      message: `${res.fullname} sukses mendaftar`,
    };
  }

  async findAll(@Query() query: any) {
    const { rowsPerPage = 10, page = 1, filter = '' } = query;

    const filterRegex = new RegExp(filter, 'i');
    const filterQuery = {
      $or: [{ username: filterRegex }, { email: filterRegex }],
    };

    const total = await this.userModel.countDocuments(filterQuery);
    const data = await this.userModel
      .find(filterQuery)
      .skip((page - 1) * rowsPerPage)
      .limit(parseInt(rowsPerPage))
      .exec();

    if (!page || !rowsPerPage) {
      this.logger.warn('Invalid query parameters', query);
      throw new BadRequestException('Page and rowsPerPage are required');
    }

    return { data, total };
  }

  async findOneByUsername(username: string) {
    const res = await this.userModel.findOne({
      username,
    });

    return res;
  }

  async findOneByEmail(email: string) {
    const res = await this.userModel.findOne({
      email,
    });

    return res;
  }

  async findOneByDynamicFilter(filter: any) {
    const res = await this.userModel.findOne(filter);

    return res;
  }

  async findById(id: string) {
    const res = await this.userModel.findById(id);
    return res;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    const res = await this.userModel.findByIdAndUpdate(
      {
        _id: id as unknown as mongoose.Types.ObjectId,
      },
      {
        username: updateUserDto.username,
        role: updateUserDto.role,
        fullname: updateUserDto.fullname,
        nip: updateUserDto.nip,
        email: updateUserDto.email,
        $inc: { __v: 1 },
      },
      { new: true, session },
    );
    if (res) {
      session.commitTransaction();
      session.endSession();
      return res;
    } else {
      session.abortTransaction();
      session.endSession();
      throw new InternalServerErrorException('Error Update Users');
    }
  }

  async remove(id: string) {
    const session = await this.connection.startSession();
    session.startTransaction();
    const res = await this.userModel.findByIdAndDelete(
      {
        _id: id as unknown as mongoose.Types.ObjectId,
      },
      { new: true, session },
    );
    if (res) {
      session.commitTransaction();
      session.endSession();
      return {
        message: 'Sukses hapus akun',
      };
    } else {
      session.abortTransaction();
      session.endSession();
      throw new NotFoundException('Account not found');
    }
  }

  async resetPassword(forgotPasswordUserDto: ForgotPasswordUserDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    const user = await this.userModel.findOne({
      resetToken: forgotPasswordUserDto.token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new InternalServerErrorException('Invalid or expired token.');
    }

    const hashedPassword = await this.generatePassword(
      forgotPasswordUserDto.newPassword,
    );
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    const res = await user.save();

    if (res) {
      session.commitTransaction();
      session.endSession();
      return { message: 'Password reset successfully.' };
    } else {
      session.abortTransaction();
      session.endSession();
      throw new InternalServerErrorException('Oopss something wrong...');
    }
  }

  async generatePassword(password: string) {
    const deceodePassowrdBase64 = Buffer.from(password!, 'base64').toString(
      'utf-8',
    );
    const saltPas = await bcrypt.genSalt(5);
    const hashPas = await bcrypt.hash(deceodePassowrdBase64, saltPas);
    return hashPas;
  }
}

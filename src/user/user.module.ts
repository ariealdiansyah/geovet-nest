import { Logger, Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
  ],
  controllers: [UserController],
  providers: [UsersService, Logger],
  exports: [UsersService],
})
export class UsersModule {}

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './user/user.module';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception-filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { EmailModule } from './email/email.module';
import { PetModule } from './pet/pet.module';
import { GroceriesModule } from './groceries/groceries.module';
import { MedicineModule } from './medicine/medicine.module';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionDetailModule } from './transaction-detail/transaction-detail.module';
import { MedicalRecordModule } from './medical-record/medical-record.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    CustomersModule,
    AuthModule,
    EmailModule,
    PetModule,
    GroceriesModule,
    MedicineModule,
    TransactionModule,
    TransactionDetailModule,
    MedicalRecordModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}

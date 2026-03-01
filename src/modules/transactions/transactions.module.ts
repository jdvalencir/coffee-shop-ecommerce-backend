import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TRANSACTION_REPOSITORY } from '../../core/tokens';
import { CustomersModule } from '../customers/customers.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { StockModule } from '../products/stock.module';
import { GetTransactionReceiptUseCase } from './application/use-cases/GetTransactionReceiptUseCase';
import { ProcessPaymentUseCase } from './application/use-cases/ProcessPaymentUseCase';
import { TransactionController } from './infraestructure/controllers/TransactionController';
import { TypeOrmTransactionRepository } from './infraestructure/database/TypeOrmTransactionRepository';
import { Transaction } from './infraestructure/entities/Transaction.entity';
import { WompiApiAdapter } from './infraestructure/external/WompiApiAdapter';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Transaction]),
    CustomersModule,
    StockModule,
    DeliveriesModule,
  ],
  controllers: [TransactionController],
  providers: [
    ProcessPaymentUseCase,
    GetTransactionReceiptUseCase,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TypeOrmTransactionRepository,
    },
    {
      provide: 'PaymentGatewayPort',
      useClass: WompiApiAdapter,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule {}

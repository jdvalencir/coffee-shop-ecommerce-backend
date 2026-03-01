import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity.js';
import { TypeOrmTransactionRepository } from './repositories/typeorm-transaction.repository.js';
import { TRANSACTION_REPOSITORY } from '../../core/tokens.js';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TypeOrmTransactionRepository,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity.js';
import { TypeOrmCustomerRepository } from './repositories/typeorm-customer.repository.js';
import { CUSTOMER_REPOSITORY } from '../../core/tokens.js';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: TypeOrmCustomerRepository,
    },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}

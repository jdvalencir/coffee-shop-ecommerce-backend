import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './modules/customers/customers.module.js';
import { Customer } from './modules/customers/entities/customer.entity.js';
import { DeliveriesModule } from './modules/deliveries/deliveries.module.js';
import { Delivery } from './modules/deliveries/entities/delivery.entity.js';
import { Product } from './modules/stock/entities/product.entity.js';
import { StockModule } from './modules/stock/stock.module.js';
import { Transaction } from './modules/transactions/entities/transaction.entity.js';
import { TransactionsModule } from './modules/transactions/transactions.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'coffee_shop'),
        entities: [Product, Customer, Transaction, Delivery],
        migrations: [],
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    StockModule,
    CustomersModule,
    TransactionsModule,
    DeliveriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './modules/customers/customers.module';
import { Customer } from './modules/customers/infraestructure/entities/Customer.entity';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { Delivery } from './modules/deliveries/infraestructure/entities/Delivery.entity';
import { Product } from './modules/products/infraestructure/entities/Product.entity';
import { StockModule } from './modules/products/stock.module';
import { Transaction } from './modules/transactions/infraestructure/entities/Transaction.entity';
import { TransactionsModule } from './modules/transactions/transactions.module';

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
  providers: [],
})
export class AppModule {}

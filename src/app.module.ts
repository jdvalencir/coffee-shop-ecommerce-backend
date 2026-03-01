import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './modules/stock/entities/product.entity';
import { Customer } from './modules/customers/entities/customer.entity';
import { Transaction } from './modules/transactions/entities/transaction.entity';
import { Delivery } from './modules/deliveries/entities/delivery.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'coffee_shop'),
        entities: [Product, Customer, Transaction, Delivery],
        migrations: [],
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

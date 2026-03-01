import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { TypeOrmProductRepository } from './repositories/typeorm-product.repository.js';
import { PRODUCT_REPOSITORY } from '../../core/tokens.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: TypeOrmProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class StockModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PRODUCT_REPOSITORY } from '../../core/tokens';
import { GetAvailableProductsUseCase } from './application/use-cases/GetAvailableProductsUseCase';
import { ProductController } from './infraestructure/controllers/ProductController';
import { TypeOrmStockRepository } from './infraestructure/database/TypeOrmStockRepository';
import { Product } from './infraestructure/entities/Product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [
    GetAvailableProductsUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: TypeOrmStockRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class StockModule {}

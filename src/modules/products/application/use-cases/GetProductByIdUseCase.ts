import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from 'src/core/tokens';
import { ProductNotFoundError } from '../../domain/errors/ProductsErrors';
import type { StockRepositoryPort } from '../ports/StockRepository.interface';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly stockRepository: StockRepositoryPort,
  ) {}

  async execute(productId: string) {
    const product = await this.stockRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    return product;
  }
}

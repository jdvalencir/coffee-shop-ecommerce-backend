import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from 'src/core/tokens';
import type { StockRepositoryPort } from '../ports/StockRepository.interface';

@Injectable()
export class GetAvailableProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly stockRepository: StockRepositoryPort,
  ) {}

  async execute() {
    return await this.stockRepository.findAllAvailable();
  }
}

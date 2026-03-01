import { Controller, Get, UseFilters } from '@nestjs/common';
import { DomainErrorFilter } from 'src/core/filters/DomainErrorFilter';
import { GetAvailableProductsUseCase } from '../../application/use-cases/GetAvailableProductsUseCase';

@Controller('products')
@UseFilters(DomainErrorFilter)
export class ProductController {
  constructor(
    private readonly getAvailableProductsUseCase: GetAvailableProductsUseCase,
  ) {}

  @Get()
  async getAvailableProducts() {
    const products = await this.getAvailableProductsUseCase.execute();
    return {
      success: true,
      products,
    };
  }
}

import { Controller, Get, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DomainErrorFilter } from 'src/core/filters/DomainErrorFilter';
import { GetAvailableProductsUseCase } from '../../application/use-cases/GetAvailableProductsUseCase';
import { GetAvailableProductsResponseDto } from '../dtos/ProductResponseDto';

@ApiTags('products')
@Controller('products')
@UseFilters(DomainErrorFilter)
export class ProductController {
  constructor(
    private readonly getAvailableProductsUseCase: GetAvailableProductsUseCase,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Lista de productos disponibles',
    type: GetAvailableProductsResponseDto,
  })
  async getAvailableProducts() {
    const products = await this.getAvailableProductsUseCase.execute();
    return {
      success: true,
      products,
    };
  }
}

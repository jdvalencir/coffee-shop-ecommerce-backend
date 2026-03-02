import { Controller, Get, Param, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { DomainErrorFilter } from 'src/core/filters/DomainErrorFilter';
import { GetAvailableProductsUseCase } from '../../application/use-cases/GetAvailableProductsUseCase';
import { GetProductByIdUseCase } from '../../application/use-cases/GetProductByIdUseCase';
import {
  GetAvailableProductsResponseDto,
  GetProductByIdResponseDto,
} from '../dtos/ProductResponseDto';

@ApiTags('products')
@Controller()
@UseFilters(DomainErrorFilter)
export class ProductController {
  constructor(
    private readonly getAvailableProductsUseCase: GetAvailableProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get('products')
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

  @Get('products/:id')
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Detalle de un producto',
    type: GetProductByIdResponseDto,
  })
  async getProductById(@Param('id') id: string) {
    const product = await this.getProductByIdUseCase.execute(id);

    return {
      success: true,
      product,
    };
  }
}

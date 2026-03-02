import { Controller, Get, Param, UseFilters } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DomainErrorFilter } from 'src/core/filters/DomainErrorFilter';
import { ErrorResponseDto } from 'src/core/infraestructure/http/ErrorResponseDto';
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
  @ApiOperation({
    summary: 'Listar productos disponibles',
    description:
      'Retorna el catalogo publico de productos con stock disponible para compra en la tienda.',
  })
  @ApiOkResponse({
    description:
      'Consulta exitosa del catalogo. Incluye la informacion necesaria para renderizar el listado en el storefront.',
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
  @ApiOperation({
    summary: 'Obtener detalle de un producto',
    description:
      'Busca un producto por su identificador y devuelve su ficha completa, incluyendo atributos opcionales como origen, notas y nivel de tueste.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID v4 del producto a consultar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description:
      'Detalle completo del producto solicitado. Ideal para vistas de PDP o validaciones previas al checkout.',
    type: GetProductByIdResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      'No existe un producto registrado con el identificador enviado en la URL.',
    type: ErrorResponseDto,
  })
  async getProductById(@Param('id') id: string) {
    const product = await this.getProductByIdUseCase.execute(id);

    return {
      success: true,
      product,
    };
  }
}

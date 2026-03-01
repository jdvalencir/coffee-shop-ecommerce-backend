import { ApiProperty } from '@nestjs/swagger';

export class ProductItemResponseDto {
  @ApiProperty({ example: 'prod-uuid-123' })
  id: string;

  @ApiProperty({ example: 'Cafe de Origen 340g' })
  name: string;

  @ApiProperty({ example: 'Cafe tostado de origen con notas achocolatadas' })
  description: string;

  @ApiProperty({ example: 250000 })
  price: number;

  @ApiProperty({ example: 12 })
  stock: number;

  @ApiProperty({ example: 'https://cdn.example.com/products/cafe-origen.jpg' })
  imageUrl: string;

  @ApiProperty({
    example: '2026-03-01T15:30:00.000Z',
    description: 'Fecha de creacion del producto',
  })
  createdAt: Date;
}

export class GetAvailableProductsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => ProductItemResponseDto, isArray: true })
  products: ProductItemResponseDto[];
}

import { ApiProperty } from '@nestjs/swagger';

export class ProductItemResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Cafe de Origen 340g' })
  name: string;

  @ApiProperty({ example: 'Cafe tostado de origen con notas achocolatadas' })
  description: string;

  @ApiProperty({ example: 250000 })
  price: number;

  @ApiProperty({ example: 12 })
  stock: number;

  @ApiProperty({
    example: 'https://cdn.example.com/products/cafe-origen.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    example: '/static/products/cafe-origen.jpg',
    required: false,
  })
  image?: string;

  @ApiProperty({
    enum: ['LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK'],
    example: 'MEDIUM',
    required: false,
  })
  roastLevel?: string;

  @ApiProperty({
    example: 'Huila, Colombia',
    required: false,
  })
  origin?: string;

  @ApiProperty({
    example: 500,
    description: 'Peso del producto en gramos',
    required: false,
  })
  weight?: number;

  @ApiProperty({
    example: ['chocolate', 'caramelo', 'ciruela'],
    required: false,
    type: [String],
  })
  notes?: string[];

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

export class GetProductByIdResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => ProductItemResponseDto })
  product: ProductItemResponseDto;
}

import 'reflect-metadata';
import {
  GetAvailableProductsResponseDto,
  GetProductByIdResponseDto,
  ProductItemResponseDto,
} from './ProductResponseDto';

describe('ProductResponseDto', () => {
  it('instantiates response dto classes', () => {
    const productItem = new ProductItemResponseDto();
    productItem.id = 'prod-1';
    productItem.name = 'Cafe';
    productItem.description = 'Cafe tostado';
    productItem.price = 250000;
    productItem.stock = 3;
    productItem.imageUrl = 'https://cdn.example.com/cafe.jpg';
    productItem.image = '/static/products/cafe.jpg';
    productItem.roastLevel = 'MEDIUM';
    productItem.origin = 'Huila, Colombia';
    productItem.weight = 340;
    productItem.notes = ['chocolate', 'caramelo'];
    productItem.createdAt = new Date('2026-03-01T15:30:00.000Z');

    const productResponse = new GetAvailableProductsResponseDto();
    productResponse.success = true;
    productResponse.products = [productItem];

    const productDetailResponse = new GetProductByIdResponseDto();
    productDetailResponse.success = true;
    productDetailResponse.product = productItem;

    expect(productResponse.success).toBe(true);
    expect(productResponse.products[0].imageUrl).toContain('cdn.example.com');
    expect(productDetailResponse.product.roastLevel).toBe('MEDIUM');
  });
});

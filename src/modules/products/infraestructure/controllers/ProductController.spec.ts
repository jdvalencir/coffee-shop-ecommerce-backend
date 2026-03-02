import 'reflect-metadata';
import { ProductController } from './ProductController';

describe('ProductController', () => {
  it('returns the available products payload', async () => {
    const products = [{ id: 'prod-1', name: 'Cafe' }];
    const getAvailableProductsUseCase = {
      execute: jest.fn().mockResolvedValue(products),
    };
    const controller = new ProductController(
      getAvailableProductsUseCase as never,
    );

    await expect(controller.getAvailableProducts()).resolves.toEqual({
      success: true,
      products,
    });
  });
});

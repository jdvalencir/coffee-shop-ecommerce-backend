import 'reflect-metadata';
import { ProductController } from './ProductController';

describe('ProductController', () => {
  it('returns the available products payload', async () => {
    const products = [{ id: 'prod-1', name: 'Cafe' }];
    const getAvailableProductsUseCase = {
      execute: jest.fn().mockResolvedValue(products),
    };
    const getProductByIdUseCase = {
      execute: jest.fn(),
    };
    const controller = new ProductController(
      getAvailableProductsUseCase as never,
      getProductByIdUseCase as never,
    );

    await expect(controller.getAvailableProducts()).resolves.toEqual({
      success: true,
      products,
    });
  });

  it('returns the product detail payload', async () => {
    const product = { id: 'prod-1', name: 'Cafe' };
    const getAvailableProductsUseCase = {
      execute: jest.fn(),
    };
    const getProductByIdUseCase = {
      execute: jest.fn().mockResolvedValue(product),
    };
    const controller = new ProductController(
      getAvailableProductsUseCase as never,
      getProductByIdUseCase as never,
    );

    await expect(controller.getProductById('prod-1')).resolves.toEqual({
      success: true,
      product,
    });
    expect(getProductByIdUseCase.execute).toHaveBeenCalledWith('prod-1');
  });
});

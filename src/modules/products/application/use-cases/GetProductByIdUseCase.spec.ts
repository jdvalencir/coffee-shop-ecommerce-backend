import { ProductNotFoundError } from '../../domain/errors/ProductsErrors';
import { GetProductByIdUseCase } from './GetProductByIdUseCase';

describe('GetProductByIdUseCase', () => {
  it('returns a product when it exists', async () => {
    const expectedProduct = { id: 'prod-1', name: 'Cafe' };
    const stockRepository = {
      findById: jest.fn().mockResolvedValue(expectedProduct),
    };

    const useCase = new GetProductByIdUseCase(stockRepository as never);

    await expect(useCase.execute('prod-1')).resolves.toEqual(expectedProduct);
    expect(stockRepository.findById).toHaveBeenCalledWith('prod-1');
  });

  it('throws when the product does not exist', async () => {
    const stockRepository = {
      findById: jest.fn().mockResolvedValue(null),
    };

    const useCase = new GetProductByIdUseCase(stockRepository as never);

    await expect(useCase.execute('missing-id')).rejects.toEqual(
      new ProductNotFoundError('missing-id'),
    );
  });
});

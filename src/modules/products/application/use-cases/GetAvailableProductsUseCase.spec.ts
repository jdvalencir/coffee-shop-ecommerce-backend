import { GetAvailableProductsUseCase } from './GetAvailableProductsUseCase';

describe('GetAvailableProductsUseCase', () => {
  it('returns all available products from the repository', async () => {
    const expectedProducts = [
      { id: 'prod-1', name: 'Cafe', stock: 4 },
      { id: 'prod-2', name: 'Blend', stock: 2 },
    ];
    const stockRepository = {
      findAllAvailable: jest.fn().mockResolvedValue(expectedProducts),
    };

    const useCase = new GetAvailableProductsUseCase(stockRepository as never);

    await expect(useCase.execute()).resolves.toEqual(expectedProducts);
    expect(stockRepository.findAllAvailable).toHaveBeenCalledTimes(1);
  });
});

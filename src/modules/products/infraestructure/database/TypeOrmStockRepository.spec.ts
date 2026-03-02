import 'reflect-metadata';
import { TypeOrmStockRepository } from './TypeOrmStockRepository';

describe('TypeOrmStockRepository', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches available products and updates stock', async () => {
    const productRepository = {
      find: jest.fn().mockResolvedValue([{ id: 'prod-1' }]),
      findOneBy: jest.fn().mockResolvedValue({ id: 'prod-1', name: 'Cafe' }),
      decrement: jest.fn().mockResolvedValue(undefined),
    };
    const repository = new TypeOrmStockRepository(productRepository as never);

    await expect(repository.findAllAvailable()).resolves.toEqual([
      { id: 'prod-1' },
    ]);
    await expect(repository.findById('prod-1')).resolves.toEqual({
      id: 'prod-1',
      name: 'Cafe',
    });
    await expect(
      repository.decreaseStock('prod-1', 2),
    ).resolves.toBeUndefined();

    expect(productRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stock: expect.anything() },
      }),
    );
    expect(productRepository.findOneBy).toHaveBeenCalledWith({ id: 'prod-1' });
    expect(productRepository.decrement).toHaveBeenCalledWith(
      { id: 'prod-1' },
      'stock',
      2,
    );
  });
});

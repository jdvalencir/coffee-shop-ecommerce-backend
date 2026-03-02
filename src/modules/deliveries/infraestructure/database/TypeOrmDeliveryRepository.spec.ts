import 'reflect-metadata';
import { TypeOrmDeliveryRepository } from './TypeOrmDeliveryRepository';

describe('TypeOrmDeliveryRepository', () => {
  it('creates deliveries tied to a transaction', async () => {
    const repo = {
      create: jest.fn().mockReturnValue({ id: 'del-1' }),
      save: jest.fn().mockResolvedValue({ id: 'del-1' }),
    };
    const repository = new TypeOrmDeliveryRepository(repo as never);

    await expect(
      repository.create({
        address: 'Calle 1',
        city: 'Bogota',
        region: 'Cundinamarca',
        transactionId: 'tx-1',
      }),
    ).resolves.toEqual({ id: 'del-1' });

    expect(repo.create).toHaveBeenCalledWith({
      address: 'Calle 1',
      city: 'Bogota',
      region: 'Cundinamarca',
      transaction: { id: 'tx-1' },
    });
  });
});

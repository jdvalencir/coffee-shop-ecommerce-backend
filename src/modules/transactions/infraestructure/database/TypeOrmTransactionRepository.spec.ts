import 'reflect-metadata';
import {
  TransactionStatus,
  type Transaction,
} from '../entities/Transaction.entity';
import { TypeOrmTransactionRepository } from './TypeOrmTransactionRepository';

describe('TypeOrmTransactionRepository', () => {
  it('creates, updates and maps transaction records', async () => {
    const createdTransaction = { id: 'tx-created' };
    const txEntity = {
      id: 'tx-created',
      amount: 263500,
      baseFee: 1500,
      deliveryFee: 12000,
      status: TransactionStatus.PENDING,
      product: { id: 'prod-1', name: 'Cafe' },
      customer: {
        id: 'cust-1',
        fullName: 'Juan Perez',
        email: 'juan@example.com',
      },
      delivery: {
        address: 'Calle 1',
        city: 'Bogota',
        region: 'Cundinamarca',
      },
      providerTransactionId: 'provider-1',
      createdAt: new Date('2026-03-02T14:30:00.000Z'),
    } as Transaction;
    const repo = {
      create: jest.fn().mockReturnValue(createdTransaction),
      save: jest.fn().mockResolvedValue({ id: 'tx-created' }),
      update: jest.fn().mockResolvedValue(undefined),
      findOne: jest
        .fn()
        .mockResolvedValueOnce(txEntity)
        .mockResolvedValueOnce(null),
    };
    const repository = new TypeOrmTransactionRepository(repo as never);

    await expect(
      repository.createPending({
        amount: 263500,
        baseFee: 1500,
        deliveryFee: 12000,
        productId: 'prod-1',
        customerId: 'cust-1',
      }),
    ).resolves.toEqual({ id: 'tx-created' });

    expect(repo.create).toHaveBeenCalledWith({
      amount: 263500,
      baseFee: 1500,
      deliveryFee: 12000,
      status: TransactionStatus.PENDING,
      product: { id: 'prod-1' },
      customer: { id: 'cust-1' },
    });

    await repository.updateStatus('tx-1', 'APPROVED', 'provider-1');
    await repository.updateStatus('tx-1', 'FAILED');
    await repository.updateStatus('tx-1', 'PENDING');

    expect(repo.update).toHaveBeenNthCalledWith(1, 'tx-1', {
      status: TransactionStatus.APPROVED,
      providerTransactionId: 'provider-1',
    });
    expect(repo.update).toHaveBeenNthCalledWith(2, 'tx-1', {
      status: TransactionStatus.FAILED,
    });
    expect(repo.update).toHaveBeenNthCalledWith(3, 'tx-1', {
      status: TransactionStatus.PENDING,
    });

    await expect(repository.findByIdWithDetails('tx-created')).resolves.toEqual(
      {
        id: 'tx-created',
        amount: 263500,
        baseFee: 1500,
        deliveryFee: 12000,
        providerTransactionId: 'provider-1',
        status: 'PENDING',
        createdAt: txEntity.createdAt,
        product: { id: 'prod-1', name: 'Cafe' },
        customer: {
          id: 'cust-1',
          name: 'Juan Perez',
          email: 'juan@example.com',
        },
        delivery: {
          address: 'Calle 1',
          city: 'Bogota',
          region: 'Cundinamarca',
        },
      },
    );
    await expect(repository.findByIdWithDetails('missing')).resolves.toBeNull();

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 'tx-created' },
      relations: ['product', 'customer', 'delivery'],
    });
  });

  it('maps nullable gateway and delivery fields', async () => {
    const repo = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn().mockResolvedValue({
        id: 'tx-nullable',
        amount: 180000,
        baseFee: 1500,
        deliveryFee: 12000,
        status: TransactionStatus.APPROVED,
        product: { id: 'prod-2', name: 'Espresso' },
        customer: {
          id: 'cust-2',
          fullName: 'Maria',
          email: 'maria@example.com',
        },
        delivery: null,
        providerTransactionId: null,
        createdAt: new Date('2026-03-02T14:30:00.000Z'),
      } as Transaction),
    };
    const repository = new TypeOrmTransactionRepository(repo as never);

    await expect(
      repository.findByIdWithDetails('tx-nullable'),
    ).resolves.toEqual({
      id: 'tx-nullable',
      amount: 180000,
      baseFee: 1500,
      deliveryFee: 12000,
      providerTransactionId: '',
      status: 'APPROVED',
      createdAt: new Date('2026-03-02T14:30:00.000Z'),
      product: { id: 'prod-2', name: 'Espresso' },
      customer: {
        id: 'cust-2',
        name: 'Maria',
        email: 'maria@example.com',
      },
      delivery: null,
    });
  });
});

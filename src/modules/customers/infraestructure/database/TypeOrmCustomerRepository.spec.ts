import 'reflect-metadata';
import { TypeOrmCustomerRepository } from './TypeOrmCustomerRepository';

describe('TypeOrmCustomerRepository', () => {
  it('creates or reuses customers', async () => {
    const existingCustomer = { id: 'cust-1', email: 'juan@example.com' };
    const repo = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(existingCustomer)
        .mockResolvedValueOnce(null),
      create: jest.fn().mockReturnValue({
        id: 'cust-2',
        fullName: 'Maria',
        email: 'maria@example.com',
        phone: '+57',
      }),
      save: jest.fn().mockResolvedValue({
        id: 'cust-2',
        fullName: 'Maria',
        email: 'maria@example.com',
        phone: '+57',
      }),
    };
    const repository = new TypeOrmCustomerRepository(repo as never);

    await expect(
      repository.createOrFind({
        fullName: 'Juan',
        email: 'juan@example.com',
        phone: '+57',
      }),
    ).resolves.toBe(existingCustomer);

    await expect(
      repository.createOrFind({
        fullName: 'Maria',
        email: 'maria@example.com',
        phone: '+57',
      }),
    ).resolves.toEqual({
      id: 'cust-2',
      fullName: 'Maria',
      email: 'maria@example.com',
      phone: '+57',
    });

    expect(repo.create).toHaveBeenCalledWith({
      fullName: 'Maria',
      email: 'maria@example.com',
      phone: '+57',
    });
  });
});

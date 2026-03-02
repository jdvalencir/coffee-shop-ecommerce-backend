import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import 'reflect-metadata';
import { CreatePaymentDto } from './CreatePaymentDto';

describe('CreatePaymentDto', () => {
  it('validates and transforms a valid payload', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      amount: '250000',
      cardToken: 'tok_test_123',
      productId: '550e8400-e29b-41d4-a716-446655440000',
      fullName: 'Juan Perez',
      email: 'juan@example.com',
      phone: '+573001234567',
      address: 'Calle 123',
      city: 'Medellin',
      region: 'Antioquia',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.amount).toBe(250000);
  });

  it('reports validation errors for invalid payloads', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      amount: '12.5',
      cardToken: '',
      productId: 'not-a-uuid',
      fullName: '',
      email: 'bad-email',
      phone: '',
      address: '',
      city: '',
      region: '',
    });

    const errors = await validate(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toEqual(
      expect.arrayContaining([
        'amount',
        'cardToken',
        'productId',
        'fullName',
        'email',
        'phone',
        'address',
        'city',
        'region',
      ]),
    );
  });
});

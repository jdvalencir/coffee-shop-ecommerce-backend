import 'reflect-metadata';
import { Result } from 'src/core/logic/Results';
import { PaymentProviderError } from '../../domain/errors/TransactionErrors';
import { CreatePaymentDto } from '../dtos/CreatePaymentDto';
import { TransactionController } from './TransactionController';

describe('TransactionController', () => {
  it('returns the transaction id for successful payments', async () => {
    const processPaymentUseCase = {
      execute: jest.fn().mockResolvedValue(Result.ok('tx-1')),
    };
    const getReceiptUseCase = {
      execute: jest.fn(),
    };
    const controller = new TransactionController(
      processPaymentUseCase as never,
      getReceiptUseCase as never,
    );

    await expect(
      controller.processPayment({ amount: 123 } as CreatePaymentDto),
    ).resolves.toEqual({
      success: true,
      transactionId: 'tx-1',
    });
  });

  it('throws domain errors and fallback errors from transaction actions', async () => {
    const processPaymentUseCase = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(
          Result.fail(new PaymentProviderError('Declinada')),
        )
        .mockResolvedValueOnce({
          isFailure: true,
          error: null,
        }),
    };
    const getReceiptUseCase = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(
          Result.fail(new PaymentProviderError('Pendiente')),
        )
        .mockResolvedValueOnce({
          isFailure: true,
          error: null,
        }),
    };
    const controller = new TransactionController(
      processPaymentUseCase as never,
      getReceiptUseCase as never,
    );

    await expect(
      controller.processPayment({} as CreatePaymentDto),
    ).rejects.toEqual(new PaymentProviderError('Declinada'));
    await expect(
      controller.processPayment({} as CreatePaymentDto),
    ).rejects.toThrow('Error de dominio no especificado');

    await expect(controller.getReceipt('tx-1')).rejects.toEqual(
      new PaymentProviderError('Pendiente'),
    );
    await expect(controller.getReceipt('tx-1')).rejects.toThrow(
      'Error de dominio no especificado',
    );
  });

  it('returns a receipt payload when the lookup succeeds', async () => {
    const receipt = { transactionId: 'tx-1', status: 'APPROVED' };
    const processPaymentUseCase = {
      execute: jest.fn(),
    };
    const getReceiptUseCase = {
      execute: jest.fn().mockResolvedValue(Result.ok(receipt)),
    };
    const controller = new TransactionController(
      processPaymentUseCase as never,
      getReceiptUseCase as never,
    );

    await expect(controller.getReceipt('tx-1')).resolves.toEqual({
      success: true,
      receipt,
    });
  });
});

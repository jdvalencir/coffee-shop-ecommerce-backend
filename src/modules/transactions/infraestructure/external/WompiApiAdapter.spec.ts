import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { WompiApiAdapter } from './WompiApiAdapter';

describe('WompiApiAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    process.env = {
      ...originalEnv,
      WOMPI_API_URL: 'https://sandbox.wompi.test/v1',
      WOMPI_PUBLIC_KEY: 'pub_test',
      WOMPI_PRIVATE_KEY: 'priv_test',
      WOMPI_INTEGRITY_KEY: 'integrity_test',
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  it('processes payments successfully', async () => {
    const httpService = {
      get: jest.fn().mockReturnValue(
        of({
          data: {
            data: {
              presigned_acceptance: { acceptance_token: 'acceptance-token' },
              presigned_personal_data_auth: {
                acceptance_token: 'personal-token',
              },
            },
          },
        }),
      ),
      post: jest.fn().mockReturnValue(
        of({
          data: {
            data: {
              id: 'provider-1',
              status: 'APPROVED',
            },
          },
        }),
      ),
    };
    const adapter = new WompiApiAdapter(httpService as never);

    const result = await adapter.processPayment({
      amountInCents: 250000,
      customerEmail: 'juan@example.com',
      reference: 'tx-1',
      paymentMethodToken: 'tok_test_123',
    });

    expect(result).toEqual({
      isSuccess: true,
      providerTransactionId: 'provider-1',
      status: 'APPROVED',
    });
    expect(httpService.get).toHaveBeenCalledWith(
      'https://sandbox.wompi.test/v1/merchants/pub_test',
    );
    expect(httpService.post).toHaveBeenCalledWith(
      'https://sandbox.wompi.test/v1/transactions',
      expect.objectContaining({
        acceptance_token: 'acceptance-token',
        accept_personal_auth: 'personal-token',
        amount_in_cents: 250000,
        customer_email: 'juan@example.com',
        reference: 'tx-1',
        signature: expect.any(String),
      }),
      {
        headers: {
          Authorization: 'Bearer priv_test',
        },
      },
    );
  });

  it('returns a failed response when environment keys are missing', async () => {
    delete process.env.WOMPI_PUBLIC_KEY;
    delete process.env.WOMPI_PRIVATE_KEY;
    delete process.env.WOMPI_INTEGRITY_KEY;

    const httpService = {
      get: jest.fn(),
      post: jest.fn(),
    };
    const adapter = new WompiApiAdapter(httpService as never);

    const result = await adapter.processPayment({
      amountInCents: 250000,
      customerEmail: 'juan@example.com',
      reference: 'tx-1',
      paymentMethodToken: 'tok_test_123',
    });

    expect(result.isSuccess).toBe(false);
    expect(result.status).toBe('ERROR');
    expect(result.errorMessage).toContain('Faltan WOMPI_PUBLIC_KEY');
    expect(httpService.get).not.toHaveBeenCalled();
    expect(httpService.post).not.toHaveBeenCalled();
  });

  it('checks payment status successfully', async () => {
    const httpService = {
      get: jest.fn().mockReturnValue(
        of({
          data: {
            data: {
              id: 'provider-1',
              status: 'APPROVED',
            },
          },
        }),
      ),
      post: jest.fn(),
    };
    const adapter = new WompiApiAdapter(httpService as never);

    await expect(adapter.checkStatus('provider-1')).resolves.toEqual({
      isSuccess: true,
      providerTransactionId: 'provider-1',
      status: 'APPROVED',
    });

    expect(httpService.get).toHaveBeenCalledWith(
      'https://sandbox.wompi.test/v1/transactions/provider-1',
      {
        headers: {
          Authorization: 'Bearer priv_test',
        },
      },
    );
  });

  it('returns a stable error payload when status lookup fails', async () => {
    const httpService = {
      get: jest
        .fn()
        .mockReturnValue(throwError(() => new Error('network failure'))),
      post: jest.fn(),
    };
    const adapter = new WompiApiAdapter(httpService as never);

    await expect(adapter.checkStatus('provider-1')).resolves.toEqual({
      isSuccess: false,
      status: 'ERROR',
      errorMessage: 'No se pudo consultar el estado de la transacción',
    });
  });
});

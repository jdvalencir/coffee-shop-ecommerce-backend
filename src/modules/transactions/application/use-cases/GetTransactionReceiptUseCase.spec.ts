import { TransactionNotFoundError } from '../../domain/errors/TransactionErrors';
import { GetTransactionReceiptUseCase } from './GetTransactionReceiptUseCase';

describe('GetTransactionReceiptUseCase', () => {
  const transactionDetails = {
    id: 'tx-1',
    amount: 250000,
    providerTransactionId: 'provider-1',
    status: 'PENDING' as const,
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
  };

  const createDependencies = () => {
    const txRepo = {
      findByIdWithDetails: jest.fn().mockResolvedValue(transactionDetails),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };
    const paymentGateway = {
      checkStatus: jest.fn(),
    };
    const productRepository = {
      decreaseStock: jest.fn().mockResolvedValue(undefined),
    };

    return {
      txRepo,
      paymentGateway,
      productRepository,
      useCase: new GetTransactionReceiptUseCase(
        txRepo as never,
        paymentGateway as never,
        productRepository as never,
      ),
    };
  };

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fails when the transaction does not exist', async () => {
    const deps = createDependencies();
    deps.txRepo.findByIdWithDetails.mockResolvedValue(null);

    const result = await deps.useCase.execute('missing-id');

    expect(result.isFailure).toBe(true);
    expect(result.error).toEqual(new TransactionNotFoundError('missing-id'));
    expect(deps.paymentGateway.checkStatus).not.toHaveBeenCalled();
  });

  it('updates the transaction and decreases stock when payment gets approved', async () => {
    const deps = createDependencies();
    deps.paymentGateway.checkStatus.mockResolvedValue({
      isSuccess: true,
      status: 'APPROVED',
      providerTransactionId: 'provider-1',
    });

    const result = await deps.useCase.execute('tx-1');

    expect(deps.paymentGateway.checkStatus).toHaveBeenCalledWith('provider-1');
    expect(deps.txRepo.updateStatus).toHaveBeenCalledWith('tx-1', 'APPROVED');
    expect(deps.productRepository.decreaseStock).toHaveBeenCalledWith(
      'prod-1',
      1,
    );
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      transactionId: 'tx-1',
      amount: 250000,
      status: 'PENDING',
      product: transactionDetails.product,
      customer: transactionDetails.customer,
      delivery: transactionDetails.delivery,
    });
  });

  it('marks the transaction as failed when the gateway rejects it', async () => {
    const deps = createDependencies();
    deps.paymentGateway.checkStatus.mockResolvedValue({
      isSuccess: false,
      status: 'DECLINED',
      providerTransactionId: 'provider-1',
    });

    const result = await deps.useCase.execute('tx-1');

    expect(deps.txRepo.updateStatus).toHaveBeenCalledWith('tx-1', 'FAILED');
    expect(deps.productRepository.decreaseStock).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
  });

  it('keeps the transaction unchanged when the gateway still reports PENDING', async () => {
    const deps = createDependencies();
    deps.paymentGateway.checkStatus.mockResolvedValue({
      isSuccess: true,
      status: 'PENDING',
      providerTransactionId: 'provider-1',
    });

    const result = await deps.useCase.execute('tx-1');

    expect(deps.paymentGateway.checkStatus).toHaveBeenCalledWith('provider-1');
    expect(deps.txRepo.updateStatus).not.toHaveBeenCalled();
    expect(deps.productRepository.decreaseStock).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
  });

  it('returns the current receipt without querying the gateway when status is final', async () => {
    const deps = createDependencies();
    deps.txRepo.findByIdWithDetails.mockResolvedValue({
      ...transactionDetails,
      status: 'APPROVED',
      providerTransactionId: '',
    });

    const result = await deps.useCase.execute('tx-1');

    expect(deps.paymentGateway.checkStatus).not.toHaveBeenCalled();
    expect(deps.txRepo.updateStatus).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('APPROVED');
  });
});

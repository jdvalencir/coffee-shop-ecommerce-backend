import { PaymentProviderError } from '../../domain/errors/TransactionErrors';
import {
  ProcessPaymentUseCase,
  type ProcessPaymentDto,
} from './ProcessPaymentUseCase';

describe('ProcessPaymentUseCase', () => {
  const dto: ProcessPaymentDto = {
    amount: 263500,
    cardToken: 'tok_test_123',
    productId: 'prod-1',
    fullName: 'Juan Perez',
    email: 'juan@example.com',
    phone: '+573001234567',
    address: 'Calle 1 # 2 - 3',
    city: 'Medellin',
    region: 'Antioquia',
  };

  const createDependencies = () => {
    const txRepo = {
      createPending: jest.fn().mockResolvedValue({ id: 'tx-1' }),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };
    const paymentGateway = {
      processPayment: jest.fn(),
    };
    const customerRepository = {
      createOrFind: jest.fn().mockResolvedValue({ id: 'cust-1' }),
    };
    const stockRepository = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: 'prod-1', stock: 3, price: 250000 }),
      decreaseStock: jest.fn().mockResolvedValue(undefined),
    };
    const deliveryRepository = {
      create: jest.fn().mockResolvedValue({ id: 'del-1' }),
    };

    return {
      txRepo,
      paymentGateway,
      customerRepository,
      stockRepository,
      deliveryRepository,
      useCase: new ProcessPaymentUseCase(
        txRepo as never,
        paymentGateway as never,
        customerRepository as never,
        stockRepository as never,
        deliveryRepository as never,
      ),
    };
  };

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fails when the product is missing or out of stock', async () => {
    const deps = createDependencies();
    deps.stockRepository.findById.mockResolvedValue(null);

    const result = await deps.useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PaymentProviderError);
    expect(deps.customerRepository.createOrFind).not.toHaveBeenCalled();
    expect(deps.txRepo.createPending).not.toHaveBeenCalled();
  });

  it('marks the transaction as failed when the gateway rejects the payment', async () => {
    const deps = createDependencies();
    deps.paymentGateway.processPayment.mockResolvedValue({
      isSuccess: false,
      status: 'DECLINED',
      errorMessage: 'Tarjeta rechazada',
    });

    const result = await deps.useCase.execute(dto);

    expect(deps.customerRepository.createOrFind).toHaveBeenCalledWith({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
    });
    expect(deps.txRepo.createPending).toHaveBeenCalledWith({
      amount: 263500,
      baseFee: 1500,
      deliveryFee: 12000,
      productId: dto.productId,
      customerId: 'cust-1',
    });
    expect(deps.deliveryRepository.create).toHaveBeenCalledWith({
      address: dto.address,
      city: dto.city,
      region: dto.region,
      transactionId: 'tx-1',
    });
    expect(deps.paymentGateway.processPayment).toHaveBeenCalledWith({
      amountInCents: 263500,
      customerEmail: dto.email,
      reference: 'tx-1',
      paymentMethodToken: dto.cardToken,
    });
    expect(deps.txRepo.updateStatus).toHaveBeenCalledWith('tx-1', 'FAILED');
    expect(result.isFailure).toBe(true);
    expect(result.error).toEqual(new PaymentProviderError('Tarjeta rechazada'));
  });

  it('uses a default gateway message when the failure has no detail', async () => {
    const deps = createDependencies();
    deps.paymentGateway.processPayment.mockResolvedValue({
      isSuccess: false,
      status: 'ERROR',
    });

    const result = await deps.useCase.execute(dto);

    expect(deps.txRepo.updateStatus).toHaveBeenCalledWith('tx-1', 'FAILED');
    expect(result.isFailure).toBe(true);
    expect(result.error).toEqual(new PaymentProviderError('Declinada'));
  });

  it('approves the transaction when the gateway returns APPROVED', async () => {
    const deps = createDependencies();
    deps.paymentGateway.processPayment.mockResolvedValue({
      isSuccess: true,
      status: 'APPROVED',
      providerTransactionId: 'provider-1',
    });

    const result = await deps.useCase.execute(dto);

    expect(deps.txRepo.updateStatus).toHaveBeenCalledWith(
      'tx-1',
      'APPROVED',
      'provider-1',
    );
    expect(deps.stockRepository.decreaseStock).toHaveBeenCalledWith('prod-1', 1);
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe('tx-1');
  });

  it('keeps the transaction pending when the gateway has not finalized it', async () => {
    const deps = createDependencies();
    deps.paymentGateway.processPayment.mockResolvedValue({
      isSuccess: true,
      status: 'PENDING',
      providerTransactionId: 'provider-2',
    });

    const result = await deps.useCase.execute(dto);

    expect(deps.txRepo.updateStatus).toHaveBeenCalledWith(
      'tx-1',
      'PENDING',
      'provider-2',
    );
    expect(deps.stockRepository.decreaseStock).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe('tx-1');
  });

  it('rejects the request when the frontend amount does not match the server calculation', async () => {
    const deps = createDependencies();

    const result = await deps.useCase.execute({
      ...dto,
      amount: 1000,
    });

    expect(result.isFailure).toBe(true);
    expect(deps.customerRepository.createOrFind).not.toHaveBeenCalled();
    expect(deps.txRepo.createPending).not.toHaveBeenCalled();
    expect(deps.paymentGateway.processPayment).not.toHaveBeenCalled();
  });
});

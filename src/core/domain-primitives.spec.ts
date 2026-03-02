import { HttpStatus } from '@nestjs/common';
import 'reflect-metadata';
import {
  BlacklistedCustomerError,
  CustomerNotFoundError,
} from '../modules/customers/domain/errors/CustomersErrors';
import {
  InvalidDeliveryAddressError,
  UnsupportedDeliveryRegionError,
} from '../modules/deliveries/domain/errors/DeliveriesErrors';
import {
  InsufficientStockError,
  InvalidProductPriceError,
  ProductNotFoundError,
} from '../modules/products/domain/errors/ProductsErrors';
import {
  InvalidTransactionAmountError,
  InvalidTransactionStateError,
  PaymentGatewayTimeoutError,
  PaymentProviderError,
  TransactionNotFoundError,
} from '../modules/transactions/domain/errors/TransactionErrors';
import { DomainError } from './errors/DomainError';
import { DomainErrorFilter } from './filters/DomainErrorFilter';
import {
  DOMAIN_ERROR_STATUS_MAP,
  type DomainErrorCode,
} from './infraestructure/http/DomainErrorStatusMap';
import { Result } from './logic/Results';
import {
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PRODUCT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from './tokens';

class TestDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}

describe('Core primitives', () => {
  it('creates successful and failed results', () => {
    const success = Result.ok('tx-1');
    const failure = Result.fail(new PaymentProviderError('Declinada'));

    expect(success.isSuccess).toBe(true);
    expect(success.isFailure).toBe(false);
    expect(success.getValue()).toBe('tx-1');

    expect(failure.isSuccess).toBe(false);
    expect(failure.isFailure).toBe(true);
    expect(failure.error).toBeInstanceOf(PaymentProviderError);
    expect(() => failure.getValue()).toThrow(
      'No se puede obtener el valor de un resultado fallido.',
    );
  });

  it('preserves domain error metadata', () => {
    const error = new TestDomainError('fallo', 'TEST_CODE');

    expect(error.name).toBe('TestDomainError');
    expect(error.message).toBe('fallo');
    expect(error.code).toBe('TEST_CODE');
  });

  it('exposes stable repository tokens', () => {
    expect(PRODUCT_REPOSITORY).toBe('PRODUCT_REPOSITORY');
    expect(CUSTOMER_REPOSITORY).toBe('CUSTOMER_REPOSITORY');
    expect(TRANSACTION_REPOSITORY).toBe('TRANSACTION_REPOSITORY');
    expect(DELIVERY_REPOSITORY).toBe('DELIVERY_REPOSITORY');
  });
});

describe('Domain error HTTP mapping', () => {
  it('maps known domain errors to HTTP statuses', () => {
    expect(DOMAIN_ERROR_STATUS_MAP).toEqual({
      INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
      INVALID_TRANSACTION_AMOUNT: HttpStatus.BAD_REQUEST,
      PAYMENT_REJECTED: HttpStatus.BAD_REQUEST,
      PRODUCT_NOT_FOUND: HttpStatus.NOT_FOUND,
    });
  });

  it('serializes known and unknown domain errors', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const response = { status, json };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    };
    const filter = new DomainErrorFilter();

    filter.catch(
      new TestDomainError('sin stock', 'INSUFFICIENT_STOCK' as DomainErrorCode),
      host as never,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.CONFLICT,
      errorCode: 'INSUFFICIENT_STOCK',
      message: 'sin stock',
    });

    status.mockClear();
    json.mockClear();

    filter.catch(
      new TestDomainError('desconocido', 'UNKNOWN_CODE'),
      host as never,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'UNKNOWN_CODE',
      message: 'desconocido',
    });
  });
});

describe('Domain error classes', () => {
  it('builds customer errors', () => {
    expect(new CustomerNotFoundError()).toMatchObject({
      code: 'CUSTOMER_NOT_FOUND',
      message: 'El cliente no se encuentra registrado en el sistema.',
    });
    expect(new BlacklistedCustomerError('user@example.com')).toMatchObject({
      code: 'BLACKLISTED_CUSTOMER',
      message:
        'El cliente con email user@example.com tiene bloqueadas las compras.',
    });
  });

  it('builds delivery errors', () => {
    expect(new UnsupportedDeliveryRegionError('Amazonas')).toMatchObject({
      code: 'UNSUPPORTED_REGION',
      message:
        'Lo sentimos, actualmente no realizamos envíos a la región: Amazonas.',
    });
    expect(new InvalidDeliveryAddressError()).toMatchObject({
      code: 'INVALID_ADDRESS',
      message:
        'La dirección de entrega proporcionada está incompleta o es inválida.',
    });
  });

  it('builds product errors', () => {
    expect(new ProductNotFoundError('prod-1')).toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      message: 'El producto con ID prod-1 no existe.',
    });
    expect(new ProductNotFoundError()).toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Producto no encontrado en el catálogo.',
    });
    expect(new InsufficientStockError('Cafe', 2)).toMatchObject({
      code: 'INSUFFICIENT_STOCK',
      message: 'Stock insuficiente para "Cafe". Solo quedan 2 unidades.',
    });
    expect(new InvalidProductPriceError()).toMatchObject({
      code: 'INVALID_PRODUCT_PRICE',
      message: 'El precio del producto no puede ser negativo o cero.',
    });
  });

  it('builds transaction errors', () => {
    expect(new TransactionNotFoundError('tx-1')).toMatchObject({
      code: 'TRANSACTION_NOT_FOUND',
      message: 'La transacción tx-1 no existe.',
    });
    expect(new TransactionNotFoundError()).toMatchObject({
      code: 'TRANSACTION_NOT_FOUND',
      message: 'Transacción no encontrada.',
    });
    expect(new PaymentProviderError('Declinada')).toMatchObject({
      code: 'PAYMENT_REJECTED',
      message:
        'El proveedor de pagos (Wompi) rechazó la transacción: Declinada',
    });
    expect(
      new InvalidTransactionStateError('PENDING', 'aprobar'),
    ).toMatchObject({
      code: 'INVALID_TRANSACTION_STATE',
      message:
        'No se puede aprobar una transacción que está en estado PENDING.',
    });
    expect(new InvalidTransactionAmountError()).toMatchObject({
      code: 'INVALID_TRANSACTION_AMOUNT',
      message:
        'El monto total de la transacción no coincide con la suma de los productos y tarifas.',
    });
    expect(new PaymentGatewayTimeoutError()).toMatchObject({
      code: 'GATEWAY_TIMEOUT',
      message:
        'La pasarela de pagos está tardando demasiado en responder. Intente de nuevo.',
    });
  });
});

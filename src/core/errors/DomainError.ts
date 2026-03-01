export abstract class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class InsufficientStockError extends DomainError {
  constructor() {
    super(
      'No hay stock suficiente para procesar la compra.',
      'INSUFFICIENT_STOCK',
    );
  }
}

export class PaymentProviderError extends DomainError {
  constructor(details: string) {
    super(
      `El proveedor de pagos rechazó la transacción: ${details}`,
      'PAYMENT_REJECTED',
    );
  }
}

export class ProductNotFoundError extends DomainError {
  constructor() {
    super(
      'El producto solicitado no existe en nuestro catálogo.',
      'PRODUCT_NOT_FOUND',
    );
  }
}

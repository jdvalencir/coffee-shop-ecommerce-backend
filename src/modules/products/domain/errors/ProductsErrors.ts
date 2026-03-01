import { DomainError } from 'src/core/errors/DomainError';

export class ProductNotFoundError extends DomainError {
  constructor(productId?: string) {
    const msg = productId
      ? `El producto con ID ${productId} no existe.`
      : 'Producto no encontrado en el catálogo.';
    super(msg, 'PRODUCT_NOT_FOUND');
  }
}

export class InsufficientStockError extends DomainError {
  constructor(productName: string, available: number) {
    super(
      `Stock insuficiente para "${productName}". Solo quedan ${available} unidades.`,
      'INSUFFICIENT_STOCK',
    );
  }
}

export class InvalidProductPriceError extends DomainError {
  constructor() {
    super(
      'El precio del producto no puede ser negativo o cero.',
      'INVALID_PRODUCT_PRICE',
    );
  }
}

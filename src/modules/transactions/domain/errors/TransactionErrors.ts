import { DomainError } from 'src/core/errors/DomainError';

export class TransactionNotFoundError extends DomainError {
  constructor(id?: string) {
    const msg = id
      ? `La transacción ${id} no existe.`
      : 'Transacción no encontrada.';
    super(msg, 'TRANSACTION_NOT_FOUND');
  }
}

export class PaymentProviderError extends DomainError {
  constructor(details: string) {
    super(
      `El proveedor de pagos (Wompi) rechazó la transacción: ${details}`,
      'PAYMENT_REJECTED',
    );
  }
}

export class InvalidTransactionStateError extends DomainError {
  constructor(currentState: string, attemptedAction: string) {
    super(
      `No se puede ${attemptedAction} una transacción que está en estado ${currentState}.`,
      'INVALID_TRANSACTION_STATE',
    );
  }
}

export class InvalidTransactionAmountError extends DomainError {
  constructor() {
    super(
      'El monto total de la transacción no coincide con la suma de los productos y tarifas.',
      'INVALID_TRANSACTION_AMOUNT',
    );
  }
}

// Si Wompi tarda demasiado en responder:
export class PaymentGatewayTimeoutError extends DomainError {
  constructor() {
    super(
      'La pasarela de pagos está tardando demasiado en responder. Intente de nuevo.',
      'GATEWAY_TIMEOUT',
    );
  }
}

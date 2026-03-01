import { DomainError } from 'src/core/errors/DomainError';

export class CustomerNotFoundError extends DomainError {
  constructor() {
    super(
      'El cliente no se encuentra registrado en el sistema.',
      'CUSTOMER_NOT_FOUND',
    );
  }
}

export class BlacklistedCustomerError extends DomainError {
  constructor(email: string) {
    super(
      `El cliente con email ${email} tiene bloqueadas las compras.`,
      'BLACKLISTED_CUSTOMER',
    );
  }
}

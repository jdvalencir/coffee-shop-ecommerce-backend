import { DomainError } from 'src/core/errors/DomainError';

export class UnsupportedDeliveryRegionError extends DomainError {
  constructor(region: string) {
    super(
      `Lo sentimos, actualmente no realizamos envíos a la región: ${region}.`,
      'UNSUPPORTED_REGION',
    );
  }
}

export class InvalidDeliveryAddressError extends DomainError {
  constructor() {
    super(
      'La dirección de entrega proporcionada está incompleta o es inválida.',
      'INVALID_ADDRESS',
    );
  }
}

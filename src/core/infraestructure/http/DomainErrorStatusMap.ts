import { HttpStatus } from '@nestjs/common';

export const DOMAIN_ERROR_STATUS_MAP = {
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  INVALID_TRANSACTION_AMOUNT: HttpStatus.BAD_REQUEST,
  PAYMENT_REJECTED: HttpStatus.BAD_REQUEST,
  PRODUCT_NOT_FOUND: HttpStatus.NOT_FOUND,
} as const;

export type DomainErrorCode = keyof typeof DOMAIN_ERROR_STATUS_MAP;

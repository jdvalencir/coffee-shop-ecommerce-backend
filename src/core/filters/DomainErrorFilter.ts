import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../errors/DomainError';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  private readonly statusMap: Record<string, HttpStatus> = {
    INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
    PAYMENT_REJECTED: HttpStatus.BAD_REQUEST,
    PRODUCT_NOT_FOUND: HttpStatus.NOT_FOUND,
  };

  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      this.statusMap[exception.code] || HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode: exception.code,
      message: exception.message,
    });
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../errors/DomainError';
import {
  DOMAIN_ERROR_STATUS_MAP,
  DomainErrorCode,
} from '../infraestructure/http/DomainErrorStatusMap';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  private readonly statusMap: Record<DomainErrorCode, HttpStatus> =
    DOMAIN_ERROR_STATUS_MAP;

  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status: HttpStatus =
      (this.statusMap[exception.code] as HttpStatus) ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode: exception.code,
      message: exception.message,
    });
  }
}

import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DomainErrorFilter } from '../../../../core/filters/DomainErrorFilter';
import { ErrorResponseDto } from '../../../../core/infraestructure/http/ErrorResponseDto';
import { GetTransactionReceiptUseCase } from '../../application/use-cases/GetTransactionReceiptUseCase';
import { ProcessPaymentUseCase } from '../../application/use-cases/ProcessPaymentUseCase';
import { CreatePaymentDto } from '../dtos/CreatePaymentDto';
import {
  GetTransactionReceiptResponseDto,
  ProcessPaymentResponseDto,
} from '../dtos/TransactionResponseDto';

@ApiTags('transactions')
@Controller('transactions')
@UseFilters(DomainErrorFilter)
export class TransactionController {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getReceiptUseCase: GetTransactionReceiptUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Procesar un pago',
    description:
      'Valida la orden, calcula el total desde backend y registra una transaccion usando el token de pago enviado por el cliente.',
  })
  @ApiBody({
    type: CreatePaymentDto,
    description:
      'Datos del checkout, incluyendo el producto seleccionado, el comprador y el token de tarjeta emitido por Wompi.',
  })
  @ApiCreatedResponse({
    description:
      'La transaccion fue creada correctamente y se devuelve el identificador para consultar el recibo.',
    type: ProcessPaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'La solicitud es invalida por datos mal formados, monto inconsistente o rechazo del proveedor de pagos.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description:
      'No hay stock suficiente para completar la compra del producto solicitado.',
    type: ErrorResponseDto,
  })
  async processPayment(@Body() body: CreatePaymentDto) {
    const result = await this.processPaymentUseCase.execute(body);

    if (result.isFailure) {
      throw result.error ?? new Error('Error de dominio no especificado');
    }
    return {
      success: true,
      transactionId: result.getValue(),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar recibo de una transaccion',
    description:
      'Obtiene el comprobante completo de una compra procesada, con desglose de valores, producto, cliente y datos de entrega.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID v4 de la transaccion que se desea consultar',
    example: 'f4b8ec52-9ad8-47d2-a9f3-6d5b67f4d4f1',
  })
  @ApiOkResponse({
    description:
      'Recibo completo de la transaccion, listo para confirmar al cliente o mostrar en un detalle de orden.',
    type: GetTransactionReceiptResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      'No existe una transaccion asociada al identificador suministrado.',
    type: ErrorResponseDto,
  })
  async getReceipt(@Param('id') id: string) {
    const result = await this.getReceiptUseCase.execute(id);
    if (result.isFailure) {
      throw result.error ?? new Error('Error de dominio no especificado');
    }
    return {
      success: true,
      receipt: result.getValue(),
    };
  }
}

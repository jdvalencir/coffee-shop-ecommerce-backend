import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DomainErrorFilter } from '../../../../core/filters/DomainErrorFilter';
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
  @ApiCreatedResponse({
    description: 'Pago procesado correctamente',
    type: ProcessPaymentResponseDto,
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
  @ApiOkResponse({
    description: 'Recibo de la transaccion',
    type: GetTransactionReceiptResponseDto,
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

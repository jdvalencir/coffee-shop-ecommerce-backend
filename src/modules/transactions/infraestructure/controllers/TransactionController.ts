import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import { DomainErrorFilter } from '../../../../core/filters/DomainErrorFilter';
import { GetTransactionReceiptUseCase } from '../../application/use-cases/GetTransactionReceiptUseCase';
import { ProcessPaymentUseCase } from '../../application/use-cases/ProcessPaymentUseCase';
import { CreatePaymentDto } from '../dtos/CreatePaymentDto';

@Controller('transactions')
@UseFilters(DomainErrorFilter)
export class TransactionController {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getReceiptUseCase: GetTransactionReceiptUseCase,
  ) {}

  @Post()
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

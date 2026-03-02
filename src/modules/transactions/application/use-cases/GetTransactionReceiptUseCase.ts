import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/logic/Results';
import { PRODUCT_REPOSITORY, TRANSACTION_REPOSITORY } from 'src/core/tokens';
import type { StockRepositoryPort } from 'src/modules/products/application/ports/StockRepository.interface';
import { TransactionNotFoundError } from '../../domain/errors/TransactionErrors';
import type { PaymentGatewayPort } from '../ports/PaymentGateway.interface';
import type { TransactionRepositoryPort } from '../ports/TransactionRepository.interface';

@Injectable()
export class GetTransactionReceiptUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly txRepo: TransactionRepositoryPort,
    @Inject('PaymentGatewayPort')
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: StockRepositoryPort,
  ) {}

  async execute(transactionId: string) {
    const txDetails = await this.txRepo.findByIdWithDetails(transactionId);
    if (!txDetails) {
      return Result.fail(new TransactionNotFoundError(transactionId));
    }

    if (txDetails.status === 'PENDING' && txDetails.providerTransactionId) {
      const realStatus = await this.paymentGateway.checkStatus(
        txDetails.providerTransactionId,
      );

      console.log('Real status from gateway:', realStatus);

      if (realStatus.status !== 'PENDING') {
        await this.txRepo.updateStatus(
          transactionId,
          realStatus.status === 'APPROVED' ? 'APPROVED' : 'FAILED',
        );
      }

      if (realStatus.status === 'APPROVED') {
        await this.productRepository.decreaseStock(txDetails.product.id, 1);
      }
    }

    const receipt = {
      transactionId: txDetails.id,
      amount: txDetails.amount,
      status: txDetails.status,
      product: txDetails.product,
      customer: txDetails.customer,
      delivery: txDetails.delivery,
    };

    return Result.ok(receipt);
  }
}

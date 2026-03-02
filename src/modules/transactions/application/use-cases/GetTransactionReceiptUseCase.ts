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

    let currentStatus = txDetails.status;

    if (txDetails.status === 'PENDING' && txDetails.providerTransactionId) {
      const realStatus = await this.paymentGateway.checkStatus(
        txDetails.providerTransactionId,
      );

      if (realStatus.status !== 'PENDING') {
        currentStatus =
          realStatus.status === 'APPROVED' ? 'APPROVED' : 'FAILED';
        await this.txRepo.updateStatus(transactionId, currentStatus);
      }

      if (realStatus.status === 'APPROVED') {
        await this.productRepository.decreaseStock(txDetails.product.id, 1);
      }
    }

    const receipt = {
      transactionId: txDetails.id,
      subtotal: txDetails.amount - txDetails.baseFee - txDetails.deliveryFee,
      baseFee: txDetails.baseFee,
      deliveryFee: txDetails.deliveryFee,
      total: txDetails.amount,
      amount: txDetails.amount,
      status: currentStatus,
      createdAt: txDetails.createdAt,
      product: txDetails.product,
      customer: txDetails.customer,
      delivery: txDetails.delivery,
    };

    return Result.ok(receipt);
  }
}

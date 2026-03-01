import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/logic/Results';
import { TRANSACTION_REPOSITORY } from 'src/core/tokens';
import { TransactionNotFoundError } from '../../domain/errors/TransactionErrors';
import type { TransactionRepositoryPort } from '../ports/TransactionRepository.interface';

@Injectable()
export class GetTransactionReceiptUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly txRepo: TransactionRepositoryPort,
  ) {}

  async execute(transactionId: string) {
    const txDetails = await this.txRepo.findByIdWithDetails(transactionId);
    if (!txDetails) {
      return Result.fail(new TransactionNotFoundError(transactionId));
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

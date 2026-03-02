import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepositoryPort } from '../../application/ports/TransactionRepository.interface';
import { Transaction, TransactionStatus } from '../entities/Transaction.entity';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
  ) {}

  async createPending(data: {
    amount: number;
    baseFee: number;
    deliveryFee: number;
    productId: string;
    customerId: string;
  }): Promise<{ id: string }> {
    const tx = this.repo.create({
      amount: data.amount,
      baseFee: data.baseFee,
      deliveryFee: data.deliveryFee,
      status: TransactionStatus.PENDING,
      product: { id: data.productId },
      customer: { id: data.customerId },
    });
    const saved = await this.repo.save(tx);
    return { id: saved.id };
  }

  async updateStatus(
    id: string,
    status: 'APPROVED' | 'FAILED' | 'PENDING',
    gatewayId?: string,
  ): Promise<void> {
    const transactionStatus =
      status === 'APPROVED'
        ? TransactionStatus.APPROVED
        : status === 'FAILED'
          ? TransactionStatus.FAILED
          : TransactionStatus.PENDING;

    const updatePayload: Partial<Transaction> = {
      status: transactionStatus,
    };

    if (gatewayId !== undefined) {
      updatePayload.providerTransactionId = gatewayId;
    }

    await this.repo.update(id, updatePayload);
  }

  async findByIdWithDetails(id: string) {
    const tx = await this.repo.findOne({
      where: { id },
      relations: ['product', 'customer', 'delivery'],
    });

    if (!tx) {
      return null;
    }

    return {
      id: tx.id,
      amount: tx.amount,
      baseFee: tx.baseFee,
      deliveryFee: tx.deliveryFee,
      providerTransactionId: tx.providerTransactionId || '',
      status: tx.status as 'APPROVED' | 'FAILED' | 'PENDING',
      createdAt: tx.createdAt,
      product: { id: tx.product.id, name: tx.product.name },
      customer: {
        id: tx.customer.id,
        name: tx.customer.fullName,
        email: tx.customer.email,
      },
      delivery: tx.delivery
        ? {
            address: tx.delivery.address,
            city: tx.delivery.city,
            region: tx.delivery.region,
          }
        : null,
    };
  }
}

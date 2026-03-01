import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity.js';
import type { ITransactionRepository } from './transaction.repository.port.js';

@Injectable()
export class TypeOrmTransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
  ) {}

  findById(id: string): Promise<Transaction | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['product', 'customer'],
    });
  }

  findByWompiId(wompiId: string): Promise<Transaction | null> {
    return this.repo.findOne({
      where: { wompiTransactionId: wompiId },
      relations: ['product', 'customer'],
    });
  }

  async save(data: Partial<Transaction>): Promise<Transaction> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Transaction>): Promise<void> {
    await this.repo.update(id, data);
  }
}

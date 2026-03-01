import type { Transaction } from '../entities/transaction.entity.js';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByWompiId(wompiId: string): Promise<Transaction | null>;
  save(data: Partial<Transaction>): Promise<Transaction>;
  update(id: string, data: Partial<Transaction>): Promise<void>;
}

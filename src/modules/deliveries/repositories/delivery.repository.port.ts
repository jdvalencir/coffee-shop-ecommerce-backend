import type { Delivery } from '../entities/delivery.entity.js';

export interface IDeliveryRepository {
  findByTransactionId(transactionId: string): Promise<Delivery | null>;
  save(data: Partial<Delivery>): Promise<Delivery>;
}

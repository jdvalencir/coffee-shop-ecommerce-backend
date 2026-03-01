import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from '../entities/delivery.entity.js';
import type { IDeliveryRepository } from './delivery.repository.port.js';

@Injectable()
export class TypeOrmDeliveryRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(Delivery)
    private readonly repo: Repository<Delivery>,
  ) {}

  findByTransactionId(transactionId: string): Promise<Delivery | null> {
    return this.repo.findOne({
      where: { transaction: { id: transactionId } },
      relations: ['transaction'],
    });
  }

  async save(data: Partial<Delivery>): Promise<Delivery> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
}

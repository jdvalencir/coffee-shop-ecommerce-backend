import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from '../entities/Delivery.entity';

@Injectable()
export class TypeOrmDeliveryRepository {
  constructor(
    @InjectRepository(Delivery)
    private readonly repo: Repository<Delivery>,
  ) {}

  async create(data: {
    address: string;
    city: string;
    region: string;
    transactionId: string;
  }) {
    const delivery = this.repo.create({
      address: data.address,
      city: data.city,
      region: data.region,
      transaction: { id: data.transactionId },
    });
    return await this.repo.save(delivery);
  }
}

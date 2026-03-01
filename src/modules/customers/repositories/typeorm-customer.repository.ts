import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity.js';
import type { ICustomerRepository } from './customer.repository.port.js';

@Injectable()
export class TypeOrmCustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  findById(id: string): Promise<Customer | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<Customer | null> {
    return this.repo.findOne({ where: { email } });
  }

  async save(data: Partial<Customer>): Promise<Customer> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
}

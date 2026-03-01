import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRepositoryPort } from '../../application/ports/CustomerRepository.interface';
import { Customer } from '../entities/Customer.entity';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  async createOrFind(data: {
    fullName: string;
    email: string;
    phone: string;
  }): Promise<Customer> {
    const existingCustomer = await this.repo.findOne({
      where: { email: data.email },
    });

    if (existingCustomer) {
      return existingCustomer;
    }

    const newCustomer = this.repo.create(data);
    return await this.repo.save(newCustomer);
  }
}

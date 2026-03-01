import type { Customer } from '../entities/customer.entity.js';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  save(data: Partial<Customer>): Promise<Customer>;
}

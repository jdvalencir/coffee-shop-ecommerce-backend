import { Customer } from '../../infraestructure/entities/Customer.entity';

export interface CustomerRepositoryPort {
  createOrFind(data: {
    fullName: string;
    email: string;
    phone: string;
  }): Promise<Customer>;
}

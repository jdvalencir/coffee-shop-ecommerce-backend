import { Delivery } from '../../infraestructure/entities/Delivery.entity';

export interface DeliveryRepositoryPort {
  create(data: {
    address: string;
    city: string;
    region: string;
    transactionId: string;
  }): Promise<Delivery>;
}

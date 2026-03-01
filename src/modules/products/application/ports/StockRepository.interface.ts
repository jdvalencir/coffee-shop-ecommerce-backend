import { Product } from '../../infraestructure/entities/Product.entity';

export interface StockRepositoryPort {
  findAllAvailable(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  decreaseStock(productId: string, quantity: number): Promise<void>;
}

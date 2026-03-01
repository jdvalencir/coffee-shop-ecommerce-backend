import type { Product } from '../entities/product.entity.js';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  save(data: Partial<Product>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<void>;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity.js';
import type { IProductRepository } from './product.repository.port.js';

@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  findById(id: string): Promise<Product | null> {
    return this.repo.findOne({ where: { id } });
  }

  findAll(): Promise<Product[]> {
    return this.repo.find();
  }

  async save(data: Partial<Product>): Promise<Product> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Product>): Promise<void> {
    await this.repo.update(id, data);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository.js';
import { StockRepositoryPort } from '../../application/ports/StockRepository.interface';
import { Product } from '../entities/Product.entity';

@Injectable()
export class TypeOrmStockRepository implements StockRepositoryPort {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAllAvailable() {
    return await this.productRepository.find({ where: { stock: MoreThan(0) } });
  }

  async findById(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    return product;
  }

  async decreaseStock(productId: string, quantity: number) {
    await this.productRepository.decrement(
      { id: productId },
      'stock',
      quantity,
    );
  }
}

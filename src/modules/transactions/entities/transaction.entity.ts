import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Product } from '../../stock/entities/product.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FAILED = 'FAILED',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ name: 'base_fee', type: 'integer', default: 0 })
  baseFee: number;

  @Column({ name: 'delivery_fee', type: 'integer', default: 0 })
  deliveryFee: number;

  @Column({
    name: 'wompi_transaction_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  wompiTransactionId: string | null;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

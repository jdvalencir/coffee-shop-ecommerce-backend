import { Delivery } from 'src/modules/deliveries/infraestructure/entities/Delivery.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../../customers/infraestructure/entities/Customer.entity';
import { Product } from '../../../products/infraestructure/entities/Product.entity';

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
    enumName: 'transaction_status',
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
    name: 'provider_transaction_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  providerTransactionId: string | null;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToOne(() => Delivery, (delivery) => delivery.transaction)
  delivery: Delivery | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

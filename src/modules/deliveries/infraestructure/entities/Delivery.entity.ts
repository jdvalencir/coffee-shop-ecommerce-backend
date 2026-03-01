import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transaction } from '../../../transactions/infraestructure/entities/Transaction.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @OneToOne(() => Transaction, (transaction) => transaction.delivery)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;
}

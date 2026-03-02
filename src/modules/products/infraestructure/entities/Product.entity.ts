import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ProductRoastLevel {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  MEDIUM_DARK = 'MEDIUM_DARK',
  DARK = 'DARK',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer' })
  price: number;

  @Column({ type: 'integer' })
  stock: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string;

  @Column({
    name: 'roast_level',
    type: 'enum',
    enum: ProductRoastLevel,
    nullable: true,
  })
  roastLevel?: ProductRoastLevel;

  @Column({ type: 'varchar', length: 255, nullable: true })
  origin?: string;

  @Column({ type: 'integer', nullable: true })
  weight?: number;

  @Column({ type: 'text', array: true, nullable: true })
  notes?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

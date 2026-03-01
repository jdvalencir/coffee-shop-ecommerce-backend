import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1740787200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE transaction_status AS ENUM ('PENDING', 'APPROVED', 'FAILED')
    `);

    await queryRunner.query(`
      CREATE TABLE products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        description text NOT NULL,
        price integer NOT NULL,
        stock integer NOT NULL,
        image_url varchar(500) NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE customers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        phone varchar(50) NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE transactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        status transaction_status DEFAULT 'PENDING',
        amount integer NOT NULL,
        base_fee integer DEFAULT 0,
        delivery_fee integer DEFAULT 0,
        wompi_transaction_id varchar(255),
        product_id uuid NOT NULL REFERENCES products(id),
        customer_id uuid NOT NULL REFERENCES customers(id),
        created_at timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE deliveries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        address varchar(255) NOT NULL,
        city varchar(100) NOT NULL,
        region varchar(100) NOT NULL,
        transaction_id uuid UNIQUE NOT NULL REFERENCES transactions(id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS deliveries`);
    await queryRunner.query(`DROP TABLE IF EXISTS transactions`);
    await queryRunner.query(`DROP TABLE IF EXISTS customers`);
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_status`);
  }
}

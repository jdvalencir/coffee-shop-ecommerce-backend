import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: 'f4b8ec52-9ad8-47d2-a9f3-6d5b67f4d4f1',
    description: 'ID de la transaccion creada',
  })
  transactionId: string;
}

export class TransactionReceiptProductDto {
  @ApiProperty({ example: 'prod-uuid-123' })
  id: string;

  @ApiProperty({ example: 'Cafe de Origen 340g' })
  name: string;
}

export class TransactionReceiptCustomerDto {
  @ApiProperty({ example: 'cust-uuid-456' })
  id: string;

  @ApiProperty({ example: 'Juan Perez' })
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  email: string;
}

export class TransactionReceiptDeliveryDto {
  @ApiProperty({ example: 'Calle Falsa 123' })
  address: string;

  @ApiProperty({ example: 'Medellin' })
  city: string;

  @ApiProperty({ example: 'Antioquia' })
  region: string;
}

export class TransactionReceiptDto {
  @ApiProperty({
    example: 'f4b8ec52-9ad8-47d2-a9f3-6d5b67f4d4f1',
    description: 'ID de la transaccion',
  })
  transactionId: string;

  @ApiProperty({ example: 25000000, description: 'Subtotal del producto' })
  subtotal: number;

  @ApiProperty({ example: 1500, description: 'Tarifa base aplicada' })
  baseFee: number;

  @ApiProperty({ example: 12000, description: 'Costo de envio aplicado' })
  deliveryFee: number;

  @ApiProperty({ example: 25013500, description: 'Total calculado por backend' })
  total: number;

  @ApiProperty({ example: 25000000, description: 'Monto registrado' })
  amount: number;

  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'FAILED'] })
  status: 'PENDING' | 'APPROVED' | 'FAILED';

  @ApiProperty({
    example: '2026-03-02T14:30:00.000Z',
    description: 'Fecha de creacion de la transaccion',
  })
  createdAt: Date;

  @ApiProperty({ type: () => TransactionReceiptProductDto })
  product: TransactionReceiptProductDto;

  @ApiProperty({ type: () => TransactionReceiptCustomerDto })
  customer: TransactionReceiptCustomerDto;

  @ApiProperty({
    type: () => TransactionReceiptDeliveryDto,
    nullable: true,
  })
  delivery: TransactionReceiptDeliveryDto | null;
}

export class GetTransactionReceiptResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => TransactionReceiptDto })
  receipt: TransactionReceiptDto;
}

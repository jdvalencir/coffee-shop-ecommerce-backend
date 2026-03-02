import 'reflect-metadata';
import {
  GetTransactionReceiptResponseDto,
  ProcessPaymentResponseDto,
  TransactionReceiptCustomerDto,
  TransactionReceiptDeliveryDto,
  TransactionReceiptDto,
  TransactionReceiptProductDto,
} from './TransactionResponseDto';

describe('TransactionResponseDto', () => {
  it('instantiates response dto classes', () => {
    const processPayment = new ProcessPaymentResponseDto();
    processPayment.success = true;
    processPayment.transactionId = 'tx-1';

    const product = new TransactionReceiptProductDto();
    product.id = 'prod-1';
    product.name = 'Cafe';

    const customer = new TransactionReceiptCustomerDto();
    customer.id = 'cust-1';
    customer.name = 'Juan Perez';
    customer.email = 'juan@example.com';

    const delivery = new TransactionReceiptDeliveryDto();
    delivery.address = 'Calle 1';
    delivery.city = 'Bogota';
    delivery.region = 'Cundinamarca';

    const receipt = new TransactionReceiptDto();
    receipt.transactionId = 'tx-1';
    receipt.amount = 250000;
    receipt.status = 'APPROVED';
    receipt.product = product;
    receipt.customer = customer;
    receipt.delivery = delivery;

    const receiptResponse = new GetTransactionReceiptResponseDto();
    receiptResponse.success = true;
    receiptResponse.receipt = receipt;

    expect(processPayment.transactionId).toBe('tx-1');
    expect(receiptResponse.receipt.product.name).toBe('Cafe');
  });
});

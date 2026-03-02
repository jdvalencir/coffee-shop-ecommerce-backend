import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/logic/Results';
import {
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PRODUCT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from 'src/core/tokens';
import type { CustomerRepositoryPort } from 'src/modules/customers/application/ports/CustomerRepository.interface';
import type { DeliveryRepositoryPort } from 'src/modules/deliveries/application/ports/DeliveryRepository.interface';
import type { StockRepositoryPort } from 'src/modules/products/application/ports/StockRepository.interface';
import { PaymentProviderError } from '../../domain/errors/TransactionErrors';
import type {
  PaymentGatewayPort,
  PaymentRequest,
} from '../ports/PaymentGateway.interface';
import type { TransactionRepositoryPort } from '../ports/TransactionRepository.interface';

export interface ProcessPaymentDto {
  amount: number;
  cardToken: string;
  productId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly txRepo: TransactionRepositoryPort,
    @Inject('PaymentGatewayPort')
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly stockRepository: StockRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(dto: ProcessPaymentDto): Promise<Result<string>> {
    const product = await this.stockRepository.findById(dto.productId);
    if (!product || product.stock <= 0) {
      return Result.fail(
        new PaymentProviderError('Producto no disponible o sin stock'),
      );
    }

    const customer = await this.customerRepository.createOrFind({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
    });

    const pendingTx = await this.txRepo.createPending({
      amount: dto.amount,
      productId: dto.productId,
      customerId: customer.id,
    });

    await this.deliveryRepository.create({
      address: dto.address,
      city: dto.city,
      region: dto.region,
      transactionId: pendingTx.id,
    });

    const request: PaymentRequest = {
      amountInCents: dto.amount,
      customerEmail: dto.email,
      reference: pendingTx.id,
      paymentMethodToken: dto.cardToken,
    };

    const response = await this.paymentGateway.processPayment(request);

    console.log('Payment gateway response:', response);

    if (!response.isSuccess) {
      await this.txRepo.updateStatus(pendingTx.id, 'FAILED');
      return Result.fail(
        new PaymentProviderError(response.errorMessage || 'Declinada'),
      );
    }

    await this.txRepo.updateStatus(
      pendingTx.id,
      response.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
      response.providerTransactionId,
    );
    return Result.ok(pendingTx.id);
  }
}

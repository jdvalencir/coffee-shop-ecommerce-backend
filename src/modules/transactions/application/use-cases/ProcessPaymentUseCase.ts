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
import { InvalidProductPriceError } from 'src/modules/products/domain/errors/ProductsErrors';
import { PaymentProviderError } from '../../domain/errors/TransactionErrors';
import { InvalidTransactionAmountError } from '../../domain/errors/TransactionErrors';
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

const BASE_FEE_IN_CENTS = 1500;
const DELIVERY_FEE_IN_CENTS = 12000;

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

    if (product.price <= 0) {
      return Result.fail(new InvalidProductPriceError());
    }

    const subtotal = product.price;
    const total = subtotal + BASE_FEE_IN_CENTS + DELIVERY_FEE_IN_CENTS;

    if (dto.amount !== total) {
      return Result.fail(new InvalidTransactionAmountError());
    }

    const customer = await this.customerRepository.createOrFind({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
    });

    const pendingTx = await this.txRepo.createPending({
      amount: total,
      baseFee: BASE_FEE_IN_CENTS,
      deliveryFee: DELIVERY_FEE_IN_CENTS,
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
      amountInCents: total,
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

    const nextStatus = response.status === 'APPROVED' ? 'APPROVED' : 'PENDING';

    await this.txRepo.updateStatus(
      pendingTx.id,
      nextStatus,
      response.providerTransactionId,
    );

    if (nextStatus === 'APPROVED') {
      await this.stockRepository.decreaseStock(dto.productId, 1);
    }

    return Result.ok(pendingTx.id);
  }
}

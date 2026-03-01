import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  PaymentGatewayPort,
  PaymentRequest,
  PaymentResponse,
} from '../../application/ports/PaymentGateway.interface';

interface WompiTransaction {
  id: string;
  status: string;
}

interface WompiApiResponse {
  data: WompiTransaction;
}

@Injectable()
export class WompiApiAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(WompiApiAdapter.name);

  private readonly apiUrl =
    process.env.WOMPI_API_URL || 'https://api-sandbox.co.uat.wompi.dev/v1';
  private readonly privateKey = process.env.WOMPI_PRIVATE_KEY;

  constructor(private readonly httpService: HttpService) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const payload = {
        amount_in_cents: request.amountInCents,
        currency: 'COP',
        customer_email: request.customerEmail,
        reference: request.reference,
        payment_method: {
          type: 'CARD',
          token: request.paymentMethodToken,
          installments: 1,
        },
      };

      const response = await firstValueFrom(
        this.httpService.post<WompiApiResponse>(
          `${this.apiUrl}/transactions`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.privateKey}`,
            },
          },
        ),
      );

      const wompiData = response.data.data;

      return {
        isSuccess: wompiData.status === 'APPROVED',
        providerTransactionId: wompiData.id,
        status: wompiData.status,
      };
    } catch (error) {
      const axiosError = error as {
        response?: { data?: any };
        message?: string;
      };
      this.logger.error(
        'Error al procesar pago en pasarela',
        axiosError.response?.data || axiosError.message,
      );

      const errorMessages = (
        axiosError.response?.data?.error?.messages as string[] | undefined
      )?.join(', ');

      return {
        isSuccess: false,
        status: 'ERROR',
        errorMessage:
          errorMessages || 'El proveedor de pagos rechazó la transacción',
      };
    }
  }
}

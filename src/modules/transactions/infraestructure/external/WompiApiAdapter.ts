import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
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

interface WompiMerchantResponse {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
    };
    presigned_personal_data_auth: {
      acceptance_token: string;
    };
  };
}

@Injectable()
export class WompiApiAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(WompiApiAdapter.name);

  private readonly apiUrl =
    process.env.WOMPI_API_URL || 'https://api-sandbox.co.uat.wompi.dev/v1';
  private readonly publicKey = process.env.WOMPI_PUBLIC_KEY;
  private readonly privateKey = process.env.WOMPI_PRIVATE_KEY;
  private readonly integrityKey = process.env.WOMPI_INTEGRITY_KEY;

  constructor(private readonly httpService: HttpService) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!this.publicKey || !this.privateKey || !this.integrityKey) {
        throw new Error(
          'Faltan WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY o WOMPI_INTEGRITY_KEY en el entorno',
        );
      }

      const acceptanceTokens = await this.getAcceptanceTokens();
      const signature = this.generateSignature(
        request.reference,
        request.amountInCents,
      );

      const payload = {
        acceptance_token: acceptanceTokens.acceptanceToken,
        accept_personal_auth: acceptanceTokens.acceptPersonalAuth,
        amount_in_cents: request.amountInCents,
        currency: 'COP',
        customer_email: request.customerEmail,
        reference: request.reference,
        signature,
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

      console.log('Respuesta de Wompi:', response.data);

      const wompiData = response.data.data;

      return {
        isSuccess:
          wompiData.status === 'APPROVED' || wompiData.status === 'PENDING',
        providerTransactionId: wompiData.id,
        status: wompiData.status,
      };
    } catch (error) {
      console.error('Error al procesar pago con Wompi:', error);

      const axiosError = error as {
        response?: { data?: any };
        message?: string;
      };
      this.logger.error(
        'Error al procesar pago en pasarela',
        axiosError.response?.data || axiosError.message,
      );

      const errorMessages =
        axiosError.response?.data?.message || axiosError.message;

      return {
        isSuccess: false,
        status: 'ERROR',
        errorMessage:
          errorMessages || 'El proveedor de pagos rechazó la transacción',
      };
    }
  }

  async checkStatus(providerTransactionId: string): Promise<PaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<WompiApiResponse>(
          `${this.apiUrl}/transactions/${providerTransactionId}`,
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
      console.error('Error al consultar estado en Wompi:', error);
      return {
        isSuccess: false,
        status: 'ERROR',
        errorMessage: 'No se pudo consultar el estado de la transacción',
      };
    }
  }

  private async getAcceptanceTokens(): Promise<{
    acceptanceToken: string;
    acceptPersonalAuth: string;
  }> {
    const response = await firstValueFrom(
      this.httpService.get<WompiMerchantResponse>(
        `${this.apiUrl}/merchants/${this.publicKey}`,
      ),
    );

    return {
      acceptanceToken: response.data.data.presigned_acceptance.acceptance_token,
      acceptPersonalAuth:
        response.data.data.presigned_personal_data_auth.acceptance_token,
    };
  }

  private generateSignature(reference: string, amountInCents: number): string {
    const rawSignature = `${reference}${amountInCents}COP${this.integrityKey}`;

    return createHash('sha256').update(rawSignature).digest('hex');
  }
}

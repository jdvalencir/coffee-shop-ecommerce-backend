export interface PaymentRequest {
  amountInCents: number;
  customerEmail: string;
  reference: string;
  paymentMethodToken: string;
}

export interface PaymentResponse {
  isSuccess: boolean;
  providerTransactionId?: string;
  status: string;
  errorMessage?: string;
}

export interface PaymentGatewayPort {
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
}

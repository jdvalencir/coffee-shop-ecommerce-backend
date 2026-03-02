export interface TransactionRepositoryPort {
  createPending(data: {
    amount: number;
    baseFee: number;
    deliveryFee: number;
    productId: string;
    customerId: string;
  }): Promise<{ id: string }>;

  updateStatus(
    id: string,
    status: 'PENDING' | 'APPROVED' | 'FAILED',
    gatewayId?: string,
  ): Promise<void>;

  findByIdWithDetails(id: string): Promise<{
    id: string;
    amount: number;
    baseFee: number;
    deliveryFee: number;
    providerTransactionId: string;
    status: 'PENDING' | 'APPROVED' | 'FAILED';
    createdAt: Date;
    product: { id: string; name: string };
    customer: { id: string; name: string; email: string };
    delivery: { address: string; city: string; region: string } | null;
  } | null>;
}

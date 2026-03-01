export class CreatePaymentDto {
  amount: number;
  cardToken: string;
  productId: string;
  customerId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

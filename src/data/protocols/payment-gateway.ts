export type PaymentMethod = {
  cardNumber: string;
  cardHolder: string;
  expirationDate: string;
  cvv: string;
};

export interface PaymentGatewayProtocol {
  initializePayment(orderId: string, amount: number, currency: string, creditCard: PaymentMethod): Promise<void>;
  capturePayment(paymentId: string): Promise<void>;
  refundPayment(paymentId: string): Promise<void>;
}

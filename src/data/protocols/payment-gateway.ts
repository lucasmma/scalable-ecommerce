export interface PaymentGatewayProtocol {
  initializePayment(amount: number, currency: string, metadata?: Record<string, any>): Promise<string>;
  capturePayment(paymentId: string): Promise<boolean>;
  refundPayment(paymentId: string, amount?: number): Promise<boolean>;
  cancelPayment(paymentId: string): Promise<boolean>;
}

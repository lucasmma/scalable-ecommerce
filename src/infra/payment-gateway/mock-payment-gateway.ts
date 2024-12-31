import { PaymentGatewayProtocol, PaymentMethod } from '../../data/protocols/payment-gateway'

class MockPaymentGateway implements PaymentGatewayProtocol {
  private payments: Map<string, { amount: number; currency: string; captured: boolean; refunded: boolean }> = new Map();

  async initializePayment(orderId: string, amount: number, currency: string, creditCard: PaymentMethod ): Promise<void> {
    // validate expiration date
    // expirationDate is DD/MM
    const [expirationMonth, expirationYear] = creditCard.expirationDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if(parseInt(expirationYear) < currentYear || (parseInt(expirationYear) === currentYear && parseInt(expirationMonth) < currentMonth)) {
      throw new Error('Invalid credit card expiration date');
    }

    if(creditCard.cardNumber !== '4242424242424242') {
      throw new Error('Invalid credit card number');
    }

    if(this.payments.has(orderId)) {
      throw new Error('Payment already exists');
    }


    this.payments.set(orderId, { amount, currency, captured: false, refunded: false });
  }

  async capturePayment(paymentId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (!payment || payment.captured) {
      throw new Error('Payment not found or already captured');
    }
    payment.captured = true;
    this.payments.set(paymentId, payment);
  }

  async refundPayment(paymentId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (!payment || !payment.captured) {
      throw new Error('Payment not found or not captured');
    }
    payment.refunded = true;
    this.payments.set(paymentId, payment);
  }
}